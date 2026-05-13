using MonoFlow.application.Common;
using MonoFlow.application.Ordenes.Commands;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Ordenes.Validators
{
    public class UpdateOrdenValidator : ICommandValidator<UpdateOrdenCommand>
    {
        public Task<CommandResult> ValidateAsync(UpdateOrdenCommand request, CancellationToken cancellationToken = default)
        {
            if (request.Id == Guid.Empty)
                return Task.FromResult(CommandResult.Fail("El Id de la orden es obligatorio."));

            // Al menos un campo a actualizar debe estar presente. (No hay que forzar si no se desea, pero es buena práctica)
            if (string.IsNullOrWhiteSpace(request.Descripcion) && string.IsNullOrWhiteSpace(request.Cliente) && string.IsNullOrWhiteSpace(request.CodigoProcedencia))
                return Task.FromResult(CommandResult.Fail("Se debe enviar al menos un campo para actualizar."));

            return Task.FromResult(CommandResult.Ok());
        }
    }
}
