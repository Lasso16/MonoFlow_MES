using MonoFlow.application.Common;
using MonoFlow.application.Articulos.Commands;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Articulos.Validators
{
    public class AddArticuloValidator : ICommandValidator<AddArticuloCommand>
    {
        public Task<CommandResult> ValidateAsync(AddArticuloCommand request, CancellationToken cancellationToken = default)
        {
            if (request.OrdenId == Guid.Empty)
                return Task.FromResult(CommandResult.Fail("El campo OrdenId es obligatorio."));

            if (string.IsNullOrWhiteSpace(request.Referencia))
                return Task.FromResult(CommandResult.Fail("La Referencia es obligatoria."));

            if (request.Linea <= 0)
                return Task.FromResult(CommandResult.Fail("La Línea debe ser mayor a cero."));

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
