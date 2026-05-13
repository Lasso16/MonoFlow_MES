using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.Operarios.Handlers;
using MonoFlow.application.Operarios.Queries;
using MonoFlow.application.tests.Helpers;
using MonoFlow.domain.Aggregates.Operarios;
using MonoFlow.domain.Aggregates.Result;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.Operarios;

public class GetOperarioByIdHandlerTests
{
    private static Mock<IAppDbContext> BuildContext(IEnumerable<Operario> operarios)
    {
        var ctx = new Mock<IAppDbContext>();
        ctx.Setup(c => c.OperariosRead).Returns(DbSetMock.Create(operarios));
        return ctx;
    }

    [Fact]
    public async Task Handle_OperarioExiste_DevuelveDTO()
    {
        var operario = Operario.Create(5, "Carlos");
        var ctx = BuildContext(new[] { operario });
        var result = await new GetOperarioByIdHandler(ctx.Object)
            .Handle(new GetOperarioByIdQuery(operario.Id), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Carlos", result.Value.Nombre);
        Assert.Equal(5, result.Value.NumeroOperario);
    }

    [Fact]
    public async Task Handle_OperarioNoExiste_DevuelveNotFound()
    {
        var ctx = BuildContext(Array.Empty<Operario>());
        var result = await new GetOperarioByIdHandler(ctx.Object)
            .Handle(new GetOperarioByIdQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(FailureStatus.NotFound, result.FailureStatus);
    }
}
