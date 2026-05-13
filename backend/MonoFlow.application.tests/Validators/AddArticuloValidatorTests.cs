using MonoFlow.application.Articulos.Commands;
using MonoFlow.application.Articulos.Validators;
using Xunit;

namespace MonoFlow.application.tests.Validators;

public class AddArticuloValidatorTests
{
    private readonly AddArticuloValidator _validator = new();

    [Fact]
    public async Task OrdenIdVacio_Falla()
    {
        var result = await _validator.ValidateAsync(new AddArticuloCommand
        {
            OrdenId = Guid.Empty, Referencia = "REF-01", Linea = 1, Cantidad = 1
        });
        Assert.False(result.Success);
    }

    [Fact]
    public async Task ReferenciaVacia_Falla()
    {
        var result = await _validator.ValidateAsync(new AddArticuloCommand
        {
            OrdenId = Guid.NewGuid(), Referencia = "", Linea = 1, Cantidad = 1
        });
        Assert.False(result.Success);
    }

    [Fact]
    public async Task LineaCeroONegativa_Falla()
    {
        var result = await _validator.ValidateAsync(new AddArticuloCommand
        {
            OrdenId = Guid.NewGuid(), Referencia = "REF-01", Linea = 0, Cantidad = 1
        });
        Assert.False(result.Success);
    }

    [Fact]
    public async Task CantidadCeroONegativa_Falla()
    {
        var result = await _validator.ValidateAsync(new AddArticuloCommand
        {
            OrdenId = Guid.NewGuid(), Referencia = "REF-01", Linea = 1, Cantidad = 0
        });
        Assert.False(result.Success);
    }

    [Fact]
    public async Task InicioPlanPosteriorAFinPlan_Falla()
    {
        var result = await _validator.ValidateAsync(new AddArticuloCommand
        {
            OrdenId = Guid.NewGuid(),
            Referencia = "REF-01",
            Linea = 1,
            Cantidad = 1,
            InicioPlan = DateTime.Now.AddDays(2),
            FinPlan = DateTime.Now.AddDays(1)
        });
        Assert.False(result.Success);
    }

    [Fact]
    public async Task DatosValidos_Exito()
    {
        var result = await _validator.ValidateAsync(new AddArticuloCommand
        {
            OrdenId = Guid.NewGuid(), Referencia = "REF-01", Linea = 1, Cantidad = 5
        });
        Assert.True(result.Success);
    }

    [Fact]
    public async Task DatosValidosConFechas_Exito()
    {
        var result = await _validator.ValidateAsync(new AddArticuloCommand
        {
            OrdenId = Guid.NewGuid(),
            Referencia = "REF-01",
            Linea = 1,
            Cantidad = 5,
            InicioPlan = DateTime.Now,
            FinPlan = DateTime.Now.AddDays(5)
        });
        Assert.True(result.Success);
    }
}
