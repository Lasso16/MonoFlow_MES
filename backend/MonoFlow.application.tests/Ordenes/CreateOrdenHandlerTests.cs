using MonoFlow.application.Common;
using MonoFlow.application.Ordenes.Commands;
using MonoFlow.application.Ordenes.Handlers;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Ordenes;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.Ordenes;

public class CreateOrdenHandlerTests
{
    private static (Mock<IOrdenRepository> repo, Mock<IUnitOfWork> uow, Mock<ICommandValidator<CreateOrdenCommand>> validator)
        BuildMocks(bool validationPasses, bool savePasses)
    {
        var validator = new Mock<ICommandValidator<CreateOrdenCommand>>();
        validator
            .Setup(v => v.ValidateAsync(It.IsAny<CreateOrdenCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(validationPasses ? CommandResult.Ok() : CommandResult.Fail("Validation error"));

        var uow = new Mock<IUnitOfWork>();
        uow.Setup(u => u.SaveEntitiesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(savePasses);

        var repo = new Mock<IOrdenRepository>();
        repo.Setup(r => r.AddAsync(It.IsAny<Orden>())).ReturnsAsync((Orden o) => o);
        repo.Setup(r => r.UnitOfWork).Returns(uow.Object);

        return (repo, uow, validator);
    }

    [Fact]
    public async Task Handle_ValidationFails_ReturnsFail_RepoNotCalled()
    {
        var (repo, _, validator) = BuildMocks(validationPasses: false, savePasses: true);
        var handler = new CreateOrdenHandler(repo.Object, validator.Object);

        var result = await handler.Handle(new CreateOrdenCommand { IdNavision = "NAV001", Descripcion = "Test" }, CancellationToken.None);

        Assert.False(result.Success);
        repo.Verify(r => r.AddAsync(It.IsAny<Orden>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SaveFails_ReturnsFail()
    {
        var (repo, _, validator) = BuildMocks(validationPasses: true, savePasses: false);
        var handler = new CreateOrdenHandler(repo.Object, validator.Object);

        var result = await handler.Handle(new CreateOrdenCommand { IdNavision = "NAV001", Descripcion = "Test" }, CancellationToken.None);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task Handle_Success_ReturnsOkWithId()
    {
        var (repo, _, validator) = BuildMocks(validationPasses: true, savePasses: true);
        var handler = new CreateOrdenHandler(repo.Object, validator.Object);

        var result = await handler.Handle(new CreateOrdenCommand { IdNavision = "NAV001", Descripcion = "Test" }, CancellationToken.None);

        Assert.True(result.Success);
        repo.Verify(r => r.AddAsync(It.IsAny<Orden>()), Times.Once);
    }
}
