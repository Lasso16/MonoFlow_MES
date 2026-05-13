using MonoFlow.application.Common;
using MonoFlow.application.Ordenes.Commands;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Ordenes.Validators
{
    public class FinalizarOrdenValidator : ICommandValidator<FinalizarOrdenCommand>
    {
        public Task<CommandResult> ValidateAsync(FinalizarOrdenCommand request, CancellationToken cancellationToken = default)
        {
            if (request.Id == Guid.Empty)
                return Task.FromResult(CommandResult.Fail("El Id de la orden es obligatorio."));

            return Task.FromResult(CommandResult.Ok());
        }
    }
}
