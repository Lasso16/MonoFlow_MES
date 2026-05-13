using MonoFlow.application.Common;
using MonoFlow.application.Operarios.Commands;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operarios.Validators
{
    public class DeactivateOperarioValidator : ICommandValidator<DeactivateOperarioCommand>
    {
        public Task<CommandResult> ValidateAsync(DeactivateOperarioCommand request, CancellationToken cancellationToken = default)
        {
            if (request.Id == Guid.Empty)
                return Task.FromResult(CommandResult.Fail("El Id del operario es obligatorio."));

            return Task.FromResult(CommandResult.Ok());
        }
    }
}
