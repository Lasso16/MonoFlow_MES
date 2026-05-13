using MonoFlow.application.Common;
using MonoFlow.application.Operarios.Commands;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operarios.Validators
{
    public class UpdateOperarioDataValidator : ICommandValidator<UpdateOperarioDataCommand>
    {
        public Task<CommandResult> ValidateAsync(UpdateOperarioDataCommand request, CancellationToken cancellationToken = default)
        {
            if (request.Id == Guid.Empty)
                return Task.FromResult(CommandResult.Fail("El Id del operario es obligatorio para actualizar."));

            if (string.IsNullOrWhiteSpace(request.Nombre) && !request.NumeroOperario.HasValue)
                return Task.FromResult(CommandResult.Fail("Se debe proporcionar al menos un valor para actualizar (Nombre o NumeroOperario)."));

            return Task.FromResult(CommandResult.Ok());
        }
    }
}
