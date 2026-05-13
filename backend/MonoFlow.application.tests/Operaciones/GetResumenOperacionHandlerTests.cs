using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.Operaciones.Handlers;
using MonoFlow.application.Operaciones.Queries;
using MonoFlow.application.tests.Helpers;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Eventos;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.domain.Aggregates.TiposEvento;
using Moq;
using Xunit;

namespace MonoFlow.application.tests.Operaciones;

public class GetResumenOperacionHandlerTests
{
    private static Mock<IAppDbContext> BuildContext(
        IEnumerable<Operacion> operaciones,
        IEnumerable<RegistroTrabajo> registros,
        IEnumerable<Evento> eventos)
    {
        var ctx = new Mock<IAppDbContext>();
        ctx.Setup(c => c.Operaciones).Returns(DbSetMock.Create(operaciones));
        ctx.Setup(c => c.RegistrosTrabajo).Returns(DbSetMock.Create(registros));
        ctx.Setup(c => c.Eventos).Returns(DbSetMock.Create(eventos));
        ctx.Setup(c => c.Rechazos).Returns(DbSetMock.Create(Array.Empty<domain.Aggregates.ProduccionesRechazadas.Rechazo>()));
        ctx.Setup(c => c.SesionesOperario).Returns(DbSetMock.Create(Array.Empty<domain.Aggregates.SesionesOperarios.SesionOperario>()));
        ctx.Setup(c => c.Producciones).Returns(DbSetMock.Create(Array.Empty<domain.Aggregates.Producciones.Produccion>()));
        ctx.Setup(c => c.Articulos).Returns(DbSetMock.Create(Array.Empty<domain.Aggregates.Articulos.Articulo>()));
        ctx.Setup(c => c.Ordenes).Returns(DbSetMock.Create(Array.Empty<domain.Aggregates.Ordenes.Orden>()));
        return ctx;
    }

    [Fact]
    public async Task Handle_OperacionNoEncontrada_RetornaNotFound()
    {
        var ctx = BuildContext(Array.Empty<Operacion>(), Array.Empty<RegistroTrabajo>(), Array.Empty<Evento>());
        var handler = new GetResumenOperacionHandler(ctx.Object);

        var result = await handler.Handle(new GetResumenOperacionQuery(Guid.Empty), CancellationToken.None);

        Assert.False(result.IsSuccess);
    }

    [Fact]
    public async Task Handle_EventosEjecucionYPausa_CalculaTiemposCorrectamente()
    {
        // All entity Ids default to Guid.Empty — use Guid.Empty as the operacion/registro key
        var operacion = new Operacion(Guid.Empty, 1, Cantidad.Create(5));
        var registro = RegistroTrabajo.Create(Guid.Empty, new List<Guid>());

        var now = new DateTime(2025, 1, 1, 10, 0, 0);

        var eventoEjecucion = new Evento(Guid.Empty, TiposEventoEstandar.Ejecucion, now.AddMinutes(-60));
        eventoEjecucion.Finalizar(now.AddMinutes(-30));  // 30 min

        var eventoPausa = new Evento(Guid.Empty, TiposEventoEstandar.Pausa, now.AddMinutes(-30));
        eventoPausa.Finalizar(now);  // 30 min

        var ctx = BuildContext(
            new[] { operacion },
            new[] { registro },
            new[] { eventoEjecucion, eventoPausa });

        var handler = new GetResumenOperacionHandler(ctx.Object);
        var result = await handler.Handle(new GetResumenOperacionQuery(Guid.Empty), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(30.0, result.Value!.TiempoEfectivo, precision: 1);
        Assert.Equal(30.0, result.Value!.TiempoPausa, precision: 1);
    }
}
