using MonoFlow.application.Common;
using MonoFlow.application.Operarios.Commands;
using MonoFlow.application.Operarios.Handlers;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operarios;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.Operarios;

public class UpdateOperarioDataHandlerTests
{
    private static (
        Mock<IOperarioRepository> repo,
        Mock<ICommandValidator<UpdateOperarioDataCommand>> validator,
        Mock<IUnitOfWork> uow) BuildMocks()
    {
        var uow = new Mock<IUnitOfWork>();
        uow.Setup(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var repo = new Mock<IOperarioRepository>();
        repo.Setup(r => r.UnitOfWork).Returns(uow.Object);
        var validator = new Mock<ICommandValidator<UpdateOperarioDataCommand>>();
        validator.Setup(v => v.ValidateAsync(It.IsAny<UpdateOperarioDataCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(CommandResult.Ok());
        return (repo, validator, uow);
    }

    [Fact]
    public async Task Handle_NumeroEnUso_RetornaFail()
    {
        var (repo, validator, _) = BuildMocks();
        var operario = Operario.Create(1, "Carlos");
        var otro = Operario.Create(2, "Otro");
        repo.Setup(r => r.GetByIdAsync(operario.Id)).ReturnsAsync(operario);
        repo.Setup(r => r.GetByNumeroAsync(2)).ReturnsAsync(otro);

        var handler = new UpdateOperarioDataHandler(repo.Object, validator.Object);
        var result = await handler.Handle(
            new UpdateOperarioDataCommand { Id = operario.Id, NumeroOperario = 2 },
            CancellationToken.None);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task Handle_Exito_ActualizaNombreYGuarda()
    {
        var (repo, validator, uow) = BuildMocks();
        var operario = Operario.Create(5, "Viejo Nombre");
        repo.Setup(r => r.GetByIdAsync(operario.Id)).ReturnsAsync(operario);

        var handler = new UpdateOperarioDataHandler(repo.Object, validator.Object);
        var result = await handler.Handle(
            new UpdateOperarioDataCommand { Id = operario.Id, Nombre = "Nuevo Nombre" },
            CancellationToken.None);

        Assert.True(result.Success);
        Assert.Equal("Nuevo Nombre", result.Data.Nombre);
        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
