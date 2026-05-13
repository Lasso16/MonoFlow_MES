using MonoFlow.application.Common;
using MonoFlow.application.Operarios.Commands;
using MonoFlow.application.Operarios.Handlers;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operarios;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.Operarios;

public class CreateOperarioHandlerTests
{
    private static (
        Mock<IOperarioRepository> repo,
        Mock<ICommandValidator<CreateOperarioCommand>> validator,
        Mock<IUnitOfWork> uow) BuildMocks()
    {
        var uow = new Mock<IUnitOfWork>();
        uow.Setup(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var repo = new Mock<IOperarioRepository>();
        repo.Setup(r => r.UnitOfWork).Returns(uow.Object);
        repo.Setup(r => r.AddAsync(It.IsAny<Operario>())).Returns<Operario>(Task.FromResult);
        var validator = new Mock<ICommandValidator<CreateOperarioCommand>>();
        return (repo, validator, uow);
    }

    [Fact]
    public async Task Handle_ValidacionFalla_RetornaFail()
    {
        var (repo, validator, _) = BuildMocks();
        validator.Setup(v => v.ValidateAsync(It.IsAny<CreateOperarioCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(CommandResult.Fail("error"));

        var handler = new CreateOperarioHandler(repo.Object, validator.Object);
        var result = await handler.Handle(new CreateOperarioCommand(1, "Test"), CancellationToken.None);

        Assert.False(result.Success);
        repo.Verify(r => r.AddAsync(It.IsAny<Operario>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Exito_AgregaOperarioYGuarda()
    {
        var (repo, validator, uow) = BuildMocks();
        validator.Setup(v => v.ValidateAsync(It.IsAny<CreateOperarioCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(CommandResult.Ok());

        var handler = new CreateOperarioHandler(repo.Object, validator.Object);
        var result = await handler.Handle(new CreateOperarioCommand(42, "Juan"), CancellationToken.None);

        Assert.True(result.Success);
        Assert.Equal("Juan", result.Data.Nombre);
        repo.Verify(r => r.AddAsync(It.IsAny<Operario>()), Times.Once);
        uow.Verify(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
