using MonoFlow.application.Ordenes.Commands;
using MonoFlow.application.Ordenes.Validators;
using Xunit;

namespace MonoFlow.application.tests.Validators;

public class UpdateOrdenValidatorTests
{
    private readonly UpdateOrdenValidator _validator = new();

    [Fact]
    public async Task IdVacio_Falla()
    {
        var result = await _validator.ValidateAsync(new UpdateOrdenCommand { Id = Guid.Empty, Descripcion = "Desc" });
        Assert.False(result.Success);
    }

    [Fact]
    public async Task SinCamposActualizar_Falla()
    {
        var result = await _validator.ValidateAsync(new UpdateOrdenCommand { Id = Guid.NewGuid() });
        Assert.False(result.Success);
    }

    [Fact]
    public async Task SoloDescripcion_Exito()
    {
        var result = await _validator.ValidateAsync(new UpdateOrdenCommand { Id = Guid.NewGuid(), Descripcion = "Nueva desc" });
        Assert.True(result.Success);
    }

    [Fact]
    public async Task SoloCliente_Exito()
    {
        var result = await _validator.ValidateAsync(new UpdateOrdenCommand { Id = Guid.NewGuid(), Cliente = "Cliente S.A." });
        Assert.True(result.Success);
    }
}
