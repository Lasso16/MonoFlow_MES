using MonoFlow.application.Common;
using MonoFlow.application.Operarios.Commands;
using MonoFlow.domain.Aggregates.Operarios;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operarios.Handlers
{
    public class DeactivateOperarioHandler : IRequestHandler<DeactivateOperarioCommand, CommandResult>
    {
        private readonly IOperarioRepository _operarioRepository;
        private readonly ICommandValidator<DeactivateOperarioCommand> _validator;

        public DeactivateOperarioHandler(IOperarioRepository operarioRepository, ICommandValidator<DeactivateOperarioCommand> validator)
        {
            _operarioRepository = operarioRepository;
            _validator = validator;
        }

        public async Task<CommandResult> Handle(DeactivateOperarioCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.Success)
                return validationResult;

            var operario = await _operarioRepository.GetByIdAsync(request.Id);
            if (operario == null) 
                return CommandResult.Fail($"No se encontró el operario con Id {request.Id}");

            operario.Desactivar();

            bool saved = await _operarioRepository.UnitOfWork.SaveEntitiesAsync(cancellationToken);
            if (!saved)
                return CommandResult.Fail("Error al intentar desactivar el operario.");

            return CommandResult.Ok("Operario desactivado correctamente.");
        }
    }
}

