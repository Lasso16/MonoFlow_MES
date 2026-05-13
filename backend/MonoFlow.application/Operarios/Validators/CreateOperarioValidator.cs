using MonoFlow.application.Common;
using MonoFlow.application.Operarios.Commands;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operarios.Validators
{
    public class CreateOperarioValidator : ICommandValidator<CreateOperarioCommand>
    {
        public Task<CommandResult> ValidateAsync(CreateOperarioCommand request, CancellationToken cancellationToken = default)
        {
            if (request.NumeroOperario <= 0)
                return Task.FromResult(CommandResult.Fail("El NumeroOperario debe ser un valor positivo mayor a cero."));

            if (string.IsNullOrWhiteSpace(request.Nombre))
                return Task.FromResult(CommandResult.Fail("El Nombre del operario es obligatorio."));

            if (request.Nombre.Length < 3)
                return Task.FromResult(CommandResult.Fail("El Nombre del operario debe tener al menos 3 caracteres."));

            return Task.FromResult(CommandResult.Ok());
        }
    }
}
