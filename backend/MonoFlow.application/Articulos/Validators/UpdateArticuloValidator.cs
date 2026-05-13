using MonoFlow.application.Common;
using MonoFlow.application.Articulos.Commands;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Articulos.Validators
{
    public class UpdateArticuloValidator : ICommandValidator<UpdateArticuloCommand>
    {
        public Task<CommandResult> ValidateAsync(UpdateArticuloCommand request, CancellationToken cancellationToken = default)
        {
            if (request.Id == Guid.Empty)
                return Task.FromResult(CommandResult.Fail("El Id del artículo es obligatorio para actualizarlo."));

            if (request.Cantidad <= 0)
                return Task.FromResult(CommandResult.Fail("La Cantidad debe ser mayor a cero."));

            if (request.InicioPlan.HasValue && request.FinPlan.HasValue)
            {
                if (request.InicioPlan.Value >= request.FinPlan.Value)
                    return Task.FromResult(CommandResult.Fail("La fecha de Fin Planificado debe ser posterior a la de Inicio."));
            }

            return Task.FromResult(CommandResult.Ok());
        }
    }
}
