using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.domain.Aggregates.TiposEvento;
using MonoFlow.domain.Events;
using Xunit;

namespace MonoFlow.domain.tests.Operaciones;

public class OperacionTests
{
    private static Operacion CreateOperacion(int cantidadTotal = 5)
        => new Operacion(Guid.NewGuid(), 1, Cantidad.Create(cantidadTotal));

    [Fact]
    public void IniciarOperacion_SetsBothFields()
    {
        var op = CreateOperacion();
        op.IniciarOperacion();
        Assert.Equal(EstadoOperacion.EnPreparacion, op.Estado);
        Assert.True(op.Inicio.HasValue);
    }

    [Fact]
    public void IniciarOperacion_YaIniciada_Throws()
    {
        var op = CreateOperacion();
        op.IniciarOperacion();
        Assert.Throws<InvalidOperationException>(() => op.IniciarOperacion());
    }

    [Fact]
    public void AgregarRegistro_EstadoFinProduccion_Throws()
    {
        var op = CreateOperacion();
        op.FinalizarOperacion();
        var registro = RegistroTrabajo.Create(op.Id, new List<Guid>());
        Assert.Throws<InvalidOperationException>(() => op.AgregarRegistro(registro));
    }

    [Fact]
    public void ProcesarInicioEvento_Preparacion_SetEnPreparacion()
    {
        var op = CreateOperacion();
        op.ProcesarInicioEvento(TiposEventoEstandar.Preparacion, DateTime.Now);
        Assert.Equal(EstadoOperacion.EnPreparacion, op.Estado);
    }

    [Fact]
    public void ProcesarInicioEvento_Ejecucion_SetEnEjecucion()
    {
        var op = CreateOperacion();
        op.ProcesarInicioEvento(TiposEventoEstandar.Ejecucion, DateTime.Now);
        Assert.Equal(EstadoOperacion.EnEjecucion, op.Estado);
    }

    [Fact]
    public void EvaluarPasoADetenido_ProduccionAlcanzaCantidad_FinProduccion()
    {
        var op = CreateOperacion(5);
        var registro = RegistroTrabajo.Create(op.Id, new List<Guid>());
        registro.RegistrarEvento(TiposEventoEstandar.Ejecucion);
        registro.RegistrarProduccion(Cantidad.Create(5));
        op.AgregarRegistro(registro);

        op.EvaluarPasoADetenido();

        Assert.Equal(EstadoOperacion.FinProduccion, op.Estado);
        Assert.Contains(op.DomainEvents, e => e is OperacionFinalizadaDomainEvent);
    }

    [Fact]
    public void EvaluarPasoADetenido_ProduccionMenorCantidad_Detenido()
    {
        var op = CreateOperacion(10);
        var registro = RegistroTrabajo.Create(op.Id, new List<Guid>());
        registro.RegistrarEvento(TiposEventoEstandar.Ejecucion);
        registro.RegistrarProduccion(Cantidad.Create(5));
        op.AgregarRegistro(registro);

        op.EvaluarPasoADetenido();

        Assert.Equal(EstadoOperacion.Detenido, op.Estado);
    }

    [Fact]
    public void CalcularProgreso_MitadProducida_50()
    {
        var op = CreateOperacion(10);
        var registro = RegistroTrabajo.Create(op.Id, new List<Guid>());
        registro.RegistrarEvento(TiposEventoEstandar.Ejecucion);
        registro.RegistrarProduccion(Cantidad.Create(5));
        op.AgregarRegistro(registro);

        var progreso = op.CalcularProgreso();

        Assert.Equal(50.0, progreso);
    }
}
