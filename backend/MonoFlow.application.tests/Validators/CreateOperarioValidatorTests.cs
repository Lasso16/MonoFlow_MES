using MonoFlow.application.Operarios.Commands;
using MonoFlow.application.Operarios.Validators;
using Xunit;

namespace MonoFlow.application.tests.Validators;

public class CreateOperarioValidatorTests
{
    private readonly CreateOperarioValidator _validator = new();

    [Fact]
    public async Task NumeroOperarioCeroONegativo_Falla()
    {
        var result = await _validator.ValidateAsync(new CreateOperarioCommand(0, "Juan"));
        Assert.False(result.Success);
    }

    [Fact]
    public async Task NombreVacio_Falla()
    {
        var result = await _validator.ValidateAsync(new CreateOperarioCommand(1, ""));
        Assert.False(result.Success);
    }

    [Fact]
    public async Task NombreDemasiadoCorto_Falla()
    {
        var result = await _validator.ValidateAsync(new CreateOperarioCommand(1, "AB"));
        Assert.False(result.Success);
    }

    [Fact]
    public async Task DatosValidos_Exito()
    {
        var result = await _validator.ValidateAsync(new CreateOperarioCommand(5, "Juan"));
        Assert.True(result.Success);
    }
}
