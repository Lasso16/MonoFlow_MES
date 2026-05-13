using MonoFlow.application.Common;
using MonoFlow.application.Ordenes.Commands;
using MonoFlow.application.Ordenes.Handlers;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.Ordenes;

public class DeleteOrdenHandlerTests
{
    private static (
        Mock<IOrdenRepository> ordenRepo,
        Mock<IRegistroTrabajoRepository> registroRepo,
        Mock<ICommandValidator<DeleteOrdenCommand>> validator,
        Mock<IUnitOfWork> uow) BuildMocks()
    {
        var uow = new Mock<IUnitOfWork>();
        uow.Setup(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var ordenRepo = new Mock<IOrdenRepository>();
        ordenRepo.Setup(r => r.UnitOfWork).Returns(uow.Object);
        ordenRepo.Setup(r => r.DeleteAsync(It.IsAny<Orden>())).Returns(Task.CompletedTask);
        var registroRepo = new Mock<IRegistroTrabajoRepository>();
        var validator = new Mock<ICommandValidator<DeleteOrdenCommand>>();
        validator.Setup(v => v.ValidateAsync(It.IsAny<DeleteOrdenCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(CommandResult.Ok());
        return (ordenRepo, registroRepo, validator, uow);
    }

    [Fact]
    public async Task Handle_OrdenNoEncontrada_RetornaFail()
    {
        var (ordenRepo, registroRepo, validator, _) = BuildMocks();
        ordenRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Orden?)null);

        var handler = new DeleteOrdenHandler(ordenRepo.Object, registroRepo.Object, validator.Object);
        var result = await handler.Handle(new DeleteOrdenCommand(Guid.NewGuid()), CancellationToken.None);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task Handle_TieneRegistrosTrabajo_RetornaFail()
    {
        var (ordenRepo, registroRepo, validator, _) = BuildMocks();
        var orden = new Orden("NAV-001", "Orden Test");
        ordenRepo.Setup(r => r.GetByIdAsync(orden.Id)).ReturnsAsync(orden);
        registroRepo.Setup(r => r.HasRegistrosByOrdenAsync(orden.Id)).ReturnsAsync(true);

        var handler = new DeleteOrdenHandler(ordenRepo.Object, registroRepo.Object, validator.Object);
        var result = await handler.Handle(new DeleteOrdenCommand(orden.Id), CancellationToken.None);

        Assert.False(result.Success);
        ordenRepo.Verify(r => r.DeleteAsync(It.IsAny<Orden>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Exito_EliminaOrdenYGuarda()
    {
        var (ordenRepo, registroRepo, validator, uow) = BuildMocks();
        var orden = new Orden("NAV-001", "Orden Test");
        ordenRepo.Setup(r => r.GetByIdAsync(orden.Id)).ReturnsAsync(orden);
        registroRepo.Setup(r => r.HasRegistrosByOrdenAsync(orden.Id)).ReturnsAsync(false);

        var handler = new DeleteOrdenHandler(ordenRepo.Object, registroRepo.Object, validator.Object);
        var result = await handler.Handle(new DeleteOrdenCommand(orden.Id), CancellationToken.None);

        Assert.True(result.Success);
        ordenRepo.Verify(r => r.DeleteAsync(orden), Times.Once);
        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
