using MonoFlow.application.Common;
using MonoFlow.application.Articulos.Commands;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Articulos.Validators
{
    public class DeleteArticuloValidator : ICommandValidator<DeleteArticuloCommand>
    {
        public Task<CommandResult> ValidateAsync(DeleteArticuloCommand request, CancellationToken cancellationToken = default)
        {
            if (request.Id == Guid.Empty)
                return Task.FromResult(CommandResult.Fail("El Id del artículo es obligatorio para eliminarlo."));

            return Task.FromResult(CommandResult.Ok());
        }
    }
}
