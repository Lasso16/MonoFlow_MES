using MonoFlow.application.Operaciones.Commands;
using MonoFlow.application.Operaciones.Validators;
using Xunit;

namespace MonoFlow.application.tests.Validators;

public class AddOperacionValidatorTests
{
    private readonly AddOperacionValidator _validator = new();

    [Fact]
    public async Task ArticuloIdVacio_Falla()
    {
        var result = await _validator.ValidateAsync(new AddOperacionCommand { ArticuloId = Guid.Empty, IdTipoOperacion = 1 });
        Assert.False(result.Success);
    }

    [Fact]
    public async Task IdTipoOperacionCero_Falla()
    {
        var result = await _validator.ValidateAsync(new AddOperacionCommand { ArticuloId = Guid.NewGuid(), IdTipoOperacion = 0 });
        Assert.False(result.Success);
    }

    [Fact]
    public async Task CantidadComponentesCeroONegativa_Falla()
    {
        var result = await _validator.ValidateAsync(new AddOperacionCommand
        {
            ArticuloId = Guid.NewGuid(),
            IdTipoOperacion = 1,
            CantidadComponentes = 0
        });
        Assert.False(result.Success);
    }

    [Fact]
    public async Task DatosValidos_Exito()
    {
        var result = await _validator.ValidateAsync(new AddOperacionCommand { ArticuloId = Guid.NewGuid(), IdTipoOperacion = 1 });
        Assert.True(result.Success);
    }
}
