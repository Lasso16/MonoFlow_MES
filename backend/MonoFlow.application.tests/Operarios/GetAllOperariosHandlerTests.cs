using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.Operarios.Handlers;
using MonoFlow.application.Operarios.Queries;
using MonoFlow.application.tests.Helpers;
using MonoFlow.domain.Aggregates.Operarios;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.Operarios;

public class GetAllOperariosHandlerTests
{
    private static Mock<IAppDbContext> BuildContext(IEnumerable<Operario> operarios)
    {
        var ctx = new Mock<IAppDbContext>();
        ctx.Setup(c => c.OperariosRead).Returns(DbSetMock.Create(operarios));
        return ctx;
    }

    [Fact]
    public async Task Handle_SinFiltros_DevuelveTodosOperarios()
    {
        var ctx = BuildContext(new[] { Operario.Create(1, "Juan"), Operario.Create(2, "Maria") });
        var result = await new GetAllOperariosHandler(ctx.Object)
            .Handle(new GetAllOperariosQuery(null, null, null), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value.Count);
    }

    [Fact]
    public async Task Handle_FiltroActivo_SoloDevuelveActivos()
    {
        var inactivo = Operario.Create(2, "Pedro");
        inactivo.Desactivar();
        var ctx = BuildContext(new[] { Operario.Create(1, "Juan"), inactivo });
        var result = await new GetAllOperariosHandler(ctx.Object)
            .Handle(new GetAllOperariosQuery(null, null, true), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value);
        Assert.Equal("Juan", result.Value[0].Nombre);
    }

    [Fact]
    public async Task Handle_SinOperarios_DevuelveListaVacia()
    {
        var ctx = BuildContext(Array.Empty<Operario>());
        var result = await new GetAllOperariosHandler(ctx.Object)
            .Handle(new GetAllOperariosQuery(null, null, null), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value);
    }
}
