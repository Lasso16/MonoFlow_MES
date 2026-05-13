using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Operarios;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;

namespace MonoFlow.application.tests.Helpers;

public static class TestDataFactory
{
    public static Operario CrearOperarioValido(int numeroOperario = 1, string nombre = "Test Operario")
        => Operario.Create(numeroOperario, nombre);

    public static Orden CrearOrdenValida(
        string idNavision = "NAV001",
        string descripcion = "Orden Test",
        string? cliente = null,
        string? codigoProcedencia = null)
        => new Orden(idNavision, descripcion, cliente, codigoProcedencia);

    public static Articulo CrearArticuloValido(
        Orden? orden = null,
        string referencia = "REF001",
        int linea = 1,
        int cantidad = 5)
    {
        orden ??= CrearOrdenValida();
        return orden.AgregarArticulo(referencia, linea, Cantidad.Create(cantidad));
    }

    public static Operacion CrearOperacionValida(
        Guid? idArticulo = null,
        int idTipoOperacion = 1,
        int cantidad = 5)
        => new Operacion(idArticulo ?? Guid.NewGuid(), idTipoOperacion, Cantidad.Create(cantidad));

    public static RegistroTrabajo CrearRegistroTrabajoValido(
        Guid? idOperacion = null,
        List<Guid>? operarios = null)
        => RegistroTrabajo.Create(
            idOperacion ?? Guid.NewGuid(),
            operarios ?? new List<Guid> { Guid.NewGuid() });
}
