using MonoFlow.application.Common;
using MonoFlow.application.Operarios.Commands;
using MonoFlow.domain.Aggregates.Operarios;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operarios.Handlers
{
    public class DeleteOperarioHandler : IRequestHandler<DeleteOperarioCommand, CommandResult>
    {
        private readonly IOperarioRepository _operarioRepository;
        private readonly ICommandValidator<DeleteOperarioCommand> _validator;

        public DeleteOperarioHandler(IOperarioRepository operarioRepository, ICommandValidator<DeleteOperarioCommand> validator)
        {
            _operarioRepository = operarioRepository;
            _validator = validator;
        }

        public async Task<CommandResult> Handle(DeleteOperarioCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.Success)
                return validationResult;

            var operario = await _operarioRepository.GetByIdAsync(request.Id);
            if (operario == null)
                return CommandResult.Fail($"No se encontró el operario con Id {request.Id}");

            bool tieneSesiones = await _operarioRepository.HasSesionesAsync(request.Id);

            if (tieneSesiones)
                operario.Desactivar();
            else
                await _operarioRepository.DeleteAsync(operario);

            bool saved = await _operarioRepository.UnitOfWork.SaveEntitiesAsync(cancellationToken);
            if (!saved)
                return CommandResult.Fail("Error al intentar eliminar o desactivar el operario.");

            return CommandResult.Ok("Operario eliminado/desactivado correctamente.");
        }
    }
}

