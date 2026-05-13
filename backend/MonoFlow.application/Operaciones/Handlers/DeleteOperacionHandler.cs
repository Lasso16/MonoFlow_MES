using MonoFlow.application.Operaciones.Commands;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.application.Common;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operaciones.Handlers
{
    public class DeleteOperacionHandler : IRequestHandler<DeleteOperacionCommand, CommandResult>
    {
        private readonly IOperacionRepository _operacionRepository;
        private readonly IRegistroTrabajoRepository _registroTrabajoRepository;

        public DeleteOperacionHandler(
            IOperacionRepository operacionRepository,
            IRegistroTrabajoRepository registroTrabajoRepository)
        {
            _operacionRepository = operacionRepository;
            _registroTrabajoRepository = registroTrabajoRepository;
        }

        public async Task<CommandResult> Handle(DeleteOperacionCommand request, CancellationToken cancellationToken)
        {
            var op = await _operacionRepository.GetByIdAsync(request.Id);
            if (op == null) return CommandResult.Fail("La operación no existe.");

            if (op.Estado != EstadoOperacion.Pendiente) 
                return CommandResult.Fail("No se puede borrar una operación que no esté en estado Pendiente.");

            var tieneRegistros = await _registroTrabajoRepository.HasRegistrosByOperacionAsync(op.Id);
            if (tieneRegistros) 
                return CommandResult.Fail("No se puede borrar la operación porque tiene registros de trabajo asociados.");

            await _operacionRepository.DeleteAsync(op);
            await _operacionRepository.UnitOfWork.SaveEntitiesAsync(cancellationToken);
            
            return CommandResult.Ok("Operación borrada correctamente.");
        }
    }
}
