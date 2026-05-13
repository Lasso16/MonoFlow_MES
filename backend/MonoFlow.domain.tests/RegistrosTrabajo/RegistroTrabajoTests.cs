using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.domain.Aggregates.TiposEvento;
using MonoFlow.domain.Events;
using Xunit;

namespace MonoFlow.domain.tests.RegistrosTrabajo;

public class RegistroTrabajoTests
{
    private static RegistroTrabajo CrearRegistro()
        => RegistroTrabajo.Create(Guid.NewGuid(), new List<Guid>());

    [Fact]
    public void Create_InitializaCorrectamente()
    {
        var registro = CrearRegistro();

        Assert.False(registro.Finalizado);
        Assert.True(registro.Inicio <= DateTime.Now);
        Assert.Single(registro.Eventos);
        Assert.Equal(TiposEventoEstandar.Preparacion, registro.Eventos.First().IdTipoEvento);
    }

    [Fact]
    public void Finalizar_SetsFinalizado()
    {
        var registro = CrearRegistro();
        registro.Finalizar();

        Assert.True(registro.Finalizado);
        Assert.True(registro.Fin.HasValue);
    }

    [Fact]
    public void Finalizar_Idempotente_NoLanza()
    {
        var registro = CrearRegistro();
        registro.Finalizar();
        var exception = Record.Exception(() => registro.Finalizar());
        Assert.Null(exception);
    }

    [Fact]
    public void RegistrarEvento_RegistroFinalizado_Throws()
    {
        var registro = CrearRegistro();
        registro.Finalizar();
        Assert.Throws<InvalidOperationException>(() => registro.RegistrarEvento(TiposEventoEstandar.Ejecucion));
    }

    [Fact]
    public void RegistrarProduccion_RegistroFinalizado_Throws()
    {
        var registro = CrearRegistro();
        registro.Finalizar();
        Assert.Throws<InvalidOperationException>(() => registro.RegistrarProduccion(Cantidad.Create(1)));
    }

    [Fact]
    public void RegistrarRechazo_RegistroFinalizado_Throws()
    {
        var registro = CrearRegistro();
        registro.Finalizar();
        Assert.Throws<InvalidOperationException>(() => registro.RegistrarRechazo(Cantidad.Create(1), 1, "motivo"));
    }

    [Fact]
    public void RegistrarEvento_EventoActivoPrevio_SeFinalizaAutomaticamente()
    {
        var registro = CrearRegistro();
        var preparacion = registro.Eventos.First();

        registro.RegistrarEvento(TiposEventoEstandar.Ejecucion);

        Assert.True(preparacion.Fin.HasValue);
    }

    [Fact]
    public void RegistrarEvento_MismoTipo_Throws()
    {
        var registro = CrearRegistro();
        Assert.Throws<InvalidOperationException>(() => registro.RegistrarEvento(TiposEventoEstandar.Preparacion));
    }

    [Fact]
    public void RegistrarEvento_Pausa_NoRequiereOrdenNatural()
    {
        var registro = CrearRegistro();
        registro.RegistrarEvento(TiposEventoEstandar.Pausa);
        Assert.Equal(2, registro.Eventos.Count);
        Assert.Equal(TiposEventoEstandar.Pausa, registro.Eventos.Last().IdTipoEvento);
    }

    [Fact]
    public void RegistrarProduccion_SinEventoEjecucion_Throws()
    {
        var registro = CrearRegistro();
        Assert.Throws<InvalidOperationException>(() => registro.RegistrarProduccion(Cantidad.Create(1)));
    }

    [Fact]
    public void RegistrarProduccion_IncrementaTotalProducidoOk()
    {
        var registro = CrearRegistro();
        registro.RegistrarEvento(TiposEventoEstandar.Ejecucion);

        registro.RegistrarProduccion(Cantidad.Create(3));

        Assert.Equal(Cantidad.Create(3), registro.TotalProducidoOk);
    }

    [Fact]
    public void RegistrarProduccion_MultiplesVeces_Acumula()
    {
        var registro = CrearRegistro();
        registro.RegistrarEvento(TiposEventoEstandar.Ejecucion);

        registro.RegistrarProduccion(Cantidad.Create(3));
        registro.RegistrarProduccion(Cantidad.Create(2));

        Assert.Equal(Cantidad.Create(5), registro.TotalProducidoOk);
    }

    [Fact]
    public void RegistrarProduccion_EmiteDomainEvent()
    {
        var registro = CrearRegistro();
        registro.RegistrarEvento(TiposEventoEstandar.Ejecucion);

        registro.RegistrarProduccion(Cantidad.Create(4));

        Assert.Contains(registro.DomainEvents, e => e is ProduccionRegistradaDomainEvent);
    }

    [Fact]
    public void RegistrarRechazo_SinEventoEjecucion_Throws()
    {
        var registro = CrearRegistro();

        Assert.Throws<InvalidOperationException>(() => registro.RegistrarRechazo(Cantidad.Create(1), 1, "motivo"));
    }

    [Fact]
    public void RegistrarRechazo_IncrementaTotalRechazado()
    {
        var registro = CrearRegistro();
        registro.RegistrarEvento(TiposEventoEstandar.Ejecucion);

        registro.RegistrarRechazo(Cantidad.Create(2), 1, "motivo");
        registro.RegistrarRechazo(Cantidad.Create(3), 1, "otro");

        Assert.Equal(Cantidad.Create(5), registro.TotalRechazado);
    }

    [Fact]
    public void RegistrarRechazo_EmiteDomainEvent()
    {
        var registro = CrearRegistro();
        registro.RegistrarEvento(TiposEventoEstandar.Ejecucion);

        registro.RegistrarRechazo(Cantidad.Create(1), 1, "motivo");

        Assert.Contains(registro.DomainEvents, e => e is RechazoRegistradoDomainEvent);
    }

    [Fact]
    public void AbrirSesion_RegistroFinalizado_Throws()
    {
        var registro = CrearRegistro();
        registro.Finalizar();

        Assert.Throws<InvalidOperationException>(() => registro.AbrirSesion(Guid.NewGuid()));
    }

    [Fact]
    public void AbrirSesion_OperarioYaTieneSession_Throws()
    {
        var operarioId = Guid.NewGuid();
        var registro = RegistroTrabajo.Create(Guid.NewGuid(), new List<Guid> { operarioId });

        Assert.Throws<Exception>(() => registro.AbrirSesion(operarioId));
    }

    [Fact]
    public void CerrarSesion_SinSesionActiva_Throws()
    {
        var registro = CrearRegistro();

        Assert.Throws<Exception>(() => registro.CerrarSesion(Guid.NewGuid()));
    }

    [Fact]
    public void CerrarSesion_UltimoOperario_FinalizaRegistro()
    {
        var operarioId = Guid.NewGuid();
        var registro = RegistroTrabajo.Create(Guid.NewGuid(), new List<Guid> { operarioId });

        registro.CerrarSesion(operarioId);

        Assert.True(registro.Finalizado);
    }

    [Fact]
    public void CerrarSesionOperario_NoActiva_DebeLanzarExcepcion()
    {
        var operarioA = Guid.NewGuid();
        var operarioB = Guid.NewGuid();
        var registro = RegistroTrabajo.Create(Guid.NewGuid(), new List<Guid> { operarioA });

        Assert.Throws<Exception>(() => registro.CerrarSesion(operarioB));
    }

    [Fact]
    public void CerrarEventoActivo_DebeSetearFechaFin()
    {
        var registro = CrearRegistro();
        var eventoActivo = registro.Eventos.First();
        Assert.False(eventoActivo.Fin.HasValue);

        registro.Finalizar();

        Assert.True(eventoActivo.Fin.HasValue);
        Assert.True(eventoActivo.Fin <= registro.Fin);
    }

    [Fact]
    public void TerminarProduccion_LanzaDomainEvent_Y_GuardaTotal()
    {
        var registro = CrearRegistro();
        registro.RegistrarEvento(TiposEventoEstandar.Ejecucion);
        registro.RegistrarProduccion(Cantidad.Create(3));
        registro.RegistrarProduccion(Cantidad.Create(2));

        registro.Finalizar();

        Assert.Equal(Cantidad.Create(5), registro.TotalProducidoOk);
        Assert.Contains(registro.DomainEvents, e => e is RegistroTrabajoFinalizadoDomainEvent);
    }
}
