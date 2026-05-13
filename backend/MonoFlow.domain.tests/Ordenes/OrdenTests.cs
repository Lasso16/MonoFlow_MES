using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Ordenes;
using Xunit;

namespace MonoFlow.domain.tests.Ordenes;

public class OrdenTests
{
    [Fact]
    public void AgregarArticulo_HappyPath_ReturnsArticulo()
    {
        var orden = new Orden("NAV001", "Test");
        var articulo = orden.AgregarArticulo("REF001", 1, Cantidad.Create(5));
        Assert.NotNull(articulo);
        Assert.Single(orden.Articulos);
    }

    [Fact]
    public void AgregarArticulo_DuplicateReferenciaLinea_Throws()
    {
        var orden = new Orden("NAV001", "Test");
        orden.AgregarArticulo("REF001", 1, Cantidad.Create(5));
        Assert.Throws<InvalidOperationException>(() => orden.AgregarArticulo("REF001", 1, Cantidad.Create(3)));
    }

    [Fact]
    public void ActualizarEstadoSegunOperaciones_NoArticulos_PENDIENTE()
    {
        var orden = new Orden("NAV001", "Test");
        orden.ActualizarEstadoSegunOperaciones();
        Assert.Equal(EstadoOrden.PENDIENTE, orden.Estado);
    }

    [Fact]
    public void ActualizarEstadoSegunOperaciones_TodosFinalizados_FINALIZADA()
    {
        var orden = new Orden("NAV001", "Test");
        var articulo = orden.AgregarArticulo("REF001", 1, Cantidad.Create(5));
        var op = articulo.AgregarOperacion(1, Cantidad.Create(5));
        op.FinalizarOperacion();
        orden.ActualizarEstadoSegunOperaciones();
        Assert.Equal(EstadoOrden.FINALIZADA, orden.Estado);
    }

    [Fact]
    public void ActualizarEstadoSegunOperaciones_Mixto_ENCURSO()
    {
        var orden = new Orden("NAV001", "Test");
        var art1 = orden.AgregarArticulo("REF001", 1, Cantidad.Create(5));
        var op1 = art1.AgregarOperacion(1, Cantidad.Create(5));
        op1.FinalizarOperacion();
        orden.AgregarArticulo("REF002", 2, Cantidad.Create(5));
        orden.ActualizarEstadoSegunOperaciones();
        Assert.Equal(EstadoOrden.ENCURSO, orden.Estado);
    }

    [Fact]
    public void ActualizarEstadoSegunOperaciones_CANCELADA_NoSeCambia()
    {
        var orden = new Orden("NAV001", "Test");
        orden.CambiarEstado(EstadoOrden.CANCELADA);
        orden.ActualizarEstadoSegunOperaciones();
        Assert.Equal(EstadoOrden.CANCELADA, orden.Estado);
    }
}
