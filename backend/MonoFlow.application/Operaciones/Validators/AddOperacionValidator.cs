using MonoFlow.application.Common;
using MonoFlow.application.Operaciones.Commands;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operaciones.Validators
{
    public class AddOperacionValidator : ICommandValidator<AddOperacionCommand>
    {
        public Task<CommandResult> ValidateAsync(AddOperacionCommand request, CancellationToken cancellationToken = default)
        {
            if (request.ArticuloId == Guid.Empty)
                return Task.FromResult(CommandResult.Fail("El ArticuloId es obligatorio."));

            if (request.IdTipoOperacion <= 0)
                return Task.FromResult(CommandResult.Fail("El IdTipoOperacion es obligatorio y debe ser mayor que cero."));

            if (request.TiempoPlan.HasValue && request.TiempoPlan.Value < 0)
                return Task.FromResult(CommandResult.Fail("El Tiempo planificado no puede ser negativo."));

            if (request.CantidadComponentes.HasValue && request.CantidadComponentes.Value <= 0)
                return Task.FromResult(CommandResult.Fail("La cantidad de componentes debe ser mayor que cero si se especifica."));

            return Task.FromResult(CommandResult.Ok());
        }
    }
}
