using MonoFlow.application.Ordenes.Commands;
using MonoFlow.application.Ordenes.Validators;
using Xunit;

namespace MonoFlow.application.tests.Validators;

public class CreateOrdenValidatorTests
{
    private readonly CreateOrdenValidator _validator = new();

    [Fact]
    public async Task IdNavisionVacio_Falla()
    {
        var result = await _validator.ValidateAsync(new CreateOrdenCommand { IdNavision = "", Descripcion = "Desc" });
        Assert.False(result.Success);
    }

    [Fact]
    public async Task DescripcionVacia_Falla()
    {
        var result = await _validator.ValidateAsync(new CreateOrdenCommand { IdNavision = "NAV-001", Descripcion = "" });
        Assert.False(result.Success);
    }

    [Fact]
    public async Task DatosValidos_Exito()
    {
        var result = await _validator.ValidateAsync(new CreateOrdenCommand { IdNavision = "NAV-001", Descripcion = "Orden test" });
        Assert.True(result.Success);
    }
}
