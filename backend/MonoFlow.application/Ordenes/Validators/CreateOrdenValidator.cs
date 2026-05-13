using MonoFlow.application.Common;
using MonoFlow.application.Ordenes.Commands;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Ordenes.Validators
{
    public class CreateOrdenValidator : ICommandValidator<CreateOrdenCommand>
    {
        public Task<CommandResult> ValidateAsync(CreateOrdenCommand request, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.IdNavision))
                return Task.FromResult(CommandResult.Fail("El IdNavision es obligatorio."));

            if (string.IsNullOrWhiteSpace(request.Descripcion))
                return Task.FromResult(CommandResult.Fail("La Descripción es obligatoria."));

            return Task.FromResult(CommandResult.Ok());
        }
    }
}
