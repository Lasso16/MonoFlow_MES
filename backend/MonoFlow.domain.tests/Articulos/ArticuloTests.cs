using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Common;
using Xunit;

namespace MonoFlow.domain.tests.Articulos;

public class ArticuloTests
{
    [Fact]
    public void Constructor_CantidadCero_Throws()
    {
        Assert.Throws<ArgumentException>(() => new Articulo(Guid.NewGuid(), "REF001", 1, Cantidad.Create(0)));
    }

    [Fact]
    public void EstablecerPlanificacion_FinAntesDeInicio_Throws()
    {
        var articulo = new Articulo(Guid.NewGuid(), "REF001", 1, Cantidad.Create(5));
        var inicio = DateTime.Now;
        var fin = inicio.AddDays(-1);
        Assert.Throws<ArgumentException>(() => articulo.EstablecerPlanificacion(inicio, fin));
    }

    [Fact]
    public void CalcularEstado_SinOperaciones_PENDIENTE()
    {
        var articulo = new Articulo(Guid.NewGuid(), "REF001", 1, Cantidad.Create(5));
        Assert.Equal(EstadoArticulo.PENDIENTE, articulo.CalcularEstado());
    }

    [Fact]
    public void CalcularEstado_TodasFinProduccion_FINALIZADO()
    {
        var articulo = new Articulo(Guid.NewGuid(), "REF001", 1, Cantidad.Create(5));
        var op = articulo.AgregarOperacion(1, Cantidad.Create(5));
        op.FinalizarOperacion();
        Assert.Equal(EstadoArticulo.FINALIZADO, articulo.CalcularEstado());
    }

    [Fact]
    public void CalcularEstado_Mixto_ENCURSO()
    {
        var articulo = new Articulo(Guid.NewGuid(), "REF001", 1, Cantidad.Create(10));
        articulo.AgregarOperacion(1, Cantidad.Create(5));
        var op2 = articulo.AgregarOperacion(2, Cantidad.Create(5));
        op2.FinalizarOperacion();
        Assert.Equal(EstadoArticulo.ENCURSO, articulo.CalcularEstado());
    }

    [Fact]
    public void CalcularPorcentajeCompletado_UnaDeDosFinalizada_50()
    {
        var articulo = new Articulo(Guid.NewGuid(), "REF001", 1, Cantidad.Create(10));
        articulo.AgregarOperacion(1, Cantidad.Create(5));
        var op2 = articulo.AgregarOperacion(2, Cantidad.Create(5));
        op2.FinalizarOperacion();
        Assert.Equal(50, articulo.CalcularPorcentajeCompletado());
    }
}
