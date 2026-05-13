using MonoFlow.application.Common;
using MonoFlow.application.Operarios.Commands;
using MonoFlow.application.Operarios.Handlers;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operarios;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.Operarios;

public class DeleteOperarioHandlerTests
{
    private static (
        Mock<IOperarioRepository> repo,
        Mock<ICommandValidator<DeleteOperarioCommand>> validator,
        Mock<IUnitOfWork> uow) BuildMocks()
    {
        var uow = new Mock<IUnitOfWork>();
        uow.Setup(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var repo = new Mock<IOperarioRepository>();
        repo.Setup(r => r.UnitOfWork).Returns(uow.Object);
        repo.Setup(r => r.DeleteAsync(It.IsAny<Operario>())).Returns(Task.CompletedTask);
        var validator = new Mock<ICommandValidator<DeleteOperarioCommand>>();
        validator.Setup(v => v.ValidateAsync(It.IsAny<DeleteOperarioCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(CommandResult.Ok());
        return (repo, validator, uow);
    }

    [Fact]
    public async Task Handle_ValidacionFalla_RetornaFail()
    {
        var (repo, validator, _) = BuildMocks();
        validator.Setup(v => v.ValidateAsync(It.IsAny<DeleteOperarioCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(CommandResult.Fail("error"));

        var handler = new DeleteOperarioHandler(repo.Object, validator.Object);
        var result = await handler.Handle(new DeleteOperarioCommand(Guid.NewGuid()), CancellationToken.None);

        Assert.False(result.Success);
        repo.Verify(r => r.GetByIdAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task Handle_OperarioNoEncontrado_RetornaFail()
    {
        var (repo, validator, _) = BuildMocks();
        repo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Operario?)null);

        var handler = new DeleteOperarioHandler(repo.Object, validator.Object);
        var result = await handler.Handle(new DeleteOperarioCommand(Guid.NewGuid()), CancellationToken.None);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task Handle_ConSesiones_DesactivaEnVezDeEliminar()
    {
        var (repo, validator, uow) = BuildMocks();
        var operario = Operario.Create(1, "Ana");
        repo.Setup(r => r.GetByIdAsync(operario.Id)).ReturnsAsync(operario);
        repo.Setup(r => r.HasSesionesAsync(operario.Id)).ReturnsAsync(true);

        var handler = new DeleteOperarioHandler(repo.Object, validator.Object);
        var result = await handler.Handle(new DeleteOperarioCommand(operario.Id), CancellationToken.None);

        Assert.True(result.Success);
        Assert.False(operario.Activo);
        repo.Verify(r => r.DeleteAsync(It.IsAny<Operario>()), Times.Never);
        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_SinSesiones_EliminaOperario()
    {
        var (repo, validator, uow) = BuildMocks();
        var operario = Operario.Create(2, "Luis");
        repo.Setup(r => r.GetByIdAsync(operario.Id)).ReturnsAsync(operario);
        repo.Setup(r => r.HasSesionesAsync(operario.Id)).ReturnsAsync(false);

        var handler = new DeleteOperarioHandler(repo.Object, validator.Object);
        var result = await handler.Handle(new DeleteOperarioCommand(operario.Id), CancellationToken.None);

        Assert.True(result.Success);
        repo.Verify(r => r.DeleteAsync(operario), Times.Once);
        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
