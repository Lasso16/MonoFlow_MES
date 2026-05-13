using MonoFlow.application.Common;
using MonoFlow.application.Operarios.Commands;
using MonoFlow.application.Operarios.Handlers;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operarios;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.Operarios;

public class DeactivateOperarioHandlerTests
{
    private static (
        Mock<IOperarioRepository> repo,
        Mock<ICommandValidator<DeactivateOperarioCommand>> validator,
        Mock<IUnitOfWork> uow) BuildMocks()
    {
        var uow = new Mock<IUnitOfWork>();
        uow.Setup(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var repo = new Mock<IOperarioRepository>();
        repo.Setup(r => r.UnitOfWork).Returns(uow.Object);
        var validator = new Mock<ICommandValidator<DeactivateOperarioCommand>>();
        validator.Setup(v => v.ValidateAsync(It.IsAny<DeactivateOperarioCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(CommandResult.Ok());
        return (repo, validator, uow);
    }

    [Fact]
    public async Task Handle_OperarioNoEncontrado_RetornaFail()
    {
        var (repo, validator, _) = BuildMocks();
        repo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Operario?)null);

        var handler = new DeactivateOperarioHandler(repo.Object, validator.Object);
        var result = await handler.Handle(new DeactivateOperarioCommand(Guid.NewGuid()), CancellationToken.None);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task Handle_Exito_DesactivaOperarioYGuarda()
    {
        var (repo, validator, uow) = BuildMocks();
        var operario = Operario.Create(1, "Ana");
        repo.Setup(r => r.GetByIdAsync(operario.Id)).ReturnsAsync(operario);

        var handler = new DeactivateOperarioHandler(repo.Object, validator.Object);
        var result = await handler.Handle(new DeactivateOperarioCommand(operario.Id), CancellationToken.None);

        Assert.True(result.Success);
        Assert.False(operario.Activo);
        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
