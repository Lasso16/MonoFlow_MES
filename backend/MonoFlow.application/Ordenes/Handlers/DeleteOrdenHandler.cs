using MonoFlow.application.Ordenes.Commands;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.application.Common;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Ordenes.Handlers
{
    public class DeleteOrdenHandler : IRequestHandler<DeleteOrdenCommand, CommandResult>
    {
        private readonly IOrdenRepository _ordenRepository;
        private readonly IRegistroTrabajoRepository _registroTrabajoRepository;
        private readonly ICommandValidator<DeleteOrdenCommand> _validator;

        public DeleteOrdenHandler(
            IOrdenRepository ordenRepository,
            IRegistroTrabajoRepository registroTrabajoRepository,
            ICommandValidator<DeleteOrdenCommand> validator)
        {
            _ordenRepository = ordenRepository;
            _registroTrabajoRepository = registroTrabajoRepository;
            _validator = validator;
        }

        public async Task<CommandResult> Handle(DeleteOrdenCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.Success)
                return validationResult;

            var orden = await _ordenRepository.GetByIdAsync(request.Id);
            if (orden == null) return CommandResult.Fail("La orden no existe.");

            var tieneRegistros = await _registroTrabajoRepository.HasRegistrosByOrdenAsync(orden.Id);
            if (tieneRegistros) return CommandResult.Fail("No se puede borrar la orden porque tiene registros de trabajo asociados.");

            await _ordenRepository.DeleteAsync(orden);
            bool saved = await _ordenRepository.UnitOfWork.SaveEntitiesAsync(cancellationToken);
            
            if (!saved) return CommandResult.Fail("Error al eliminar la orden.");

            return CommandResult.Ok("Orden borrada correctamente.");
        }
    }
}
