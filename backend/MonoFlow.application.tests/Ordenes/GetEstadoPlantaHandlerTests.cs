using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.Ordenes.Handlers;
using MonoFlow.application.Ordenes.Queries;
using MonoFlow.application.tests.Helpers;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Ordenes;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.Ordenes;

public class GetEstadoPlantaHandlerTests
{
    private static Mock<IAppDbContext> BuildContext(IEnumerable<Orden> ordenes)
    {
        var ctx = new Mock<IAppDbContext>();
        ctx.Setup(c => c.Ordenes).Returns(DbSetMock.Create(ordenes));
        return ctx;
    }

    private static Orden CrearOrdenEncursoConOperacionActiva()
    {
        var orden = new Orden("NAV001", "Test");
        orden.Iniciar();
        var articulo = orden.AgregarArticulo("REF001", 1, Cantidad.Create(5));
        var operacion = articulo.AgregarOperacion(1, Cantidad.Create(5));
        operacion.IniciarOperacion();  // EnPreparacion → articulo.CalcularEstado() = ENCURSO
        return orden;
    }

    [Fact]
    public async Task Handle_SinOrdenesEncurso_ResultadoVacio()
    {
        var ordenPendiente = new Orden("NAV001", "Test");  // Estado = PENDIENTE por defecto
        var ctx = BuildContext(new[] { ordenPendiente });
        var handler = new GetEstadoPlantaHandler(ctx.Object);

        var result = await handler.Handle(new GetEstadoPlantaQuery(), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_OrdenEncursoConArticuloActivo_AparaceEnResultado()
    {
        var orden = CrearOrdenEncursoConOperacionActiva();
        var ctx = BuildContext(new[] { orden });
        var handler = new GetEstadoPlantaHandler(ctx.Object);

        var result = await handler.Handle(new GetEstadoPlantaQuery(), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("NAV001", result[0].IdNavision);
        Assert.Single(result[0].Articulos);
    }

    [Fact]
    public async Task Handle_MixtoOrdenesEncursoYPendiente_SoloDevuelveEncurso()
    {
        var ordenEncurso = CrearOrdenEncursoConOperacionActiva();
        var ordenPendiente = new Orden("NAV002", "Otra");
        var ctx = BuildContext(new[] { ordenEncurso, ordenPendiente });
        var handler = new GetEstadoPlantaHandler(ctx.Object);

        var result = await handler.Handle(new GetEstadoPlantaQuery(), CancellationToken.None);

        Assert.Single(result);
        Assert.Equal("NAV001", result[0].IdNavision);
    }
}
