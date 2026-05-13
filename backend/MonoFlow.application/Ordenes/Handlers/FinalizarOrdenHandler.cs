using MonoFlow.application.Common;
using MonoFlow.application.Ordenes.Commands;
using MonoFlow.domain.Aggregates.Ordenes;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Ordenes.Handlers
{
    public class FinalizarOrdenHandler : IRequestHandler<FinalizarOrdenCommand, CommandResult>
    {
        private readonly IOrdenRepository _ordenRepository;
        private readonly ICommandValidator<FinalizarOrdenCommand> _validator;

        public FinalizarOrdenHandler(IOrdenRepository ordenRepository, ICommandValidator<FinalizarOrdenCommand> validator)
        {
            _ordenRepository = ordenRepository;
            _validator = validator;
        }

        public async Task<CommandResult> Handle(FinalizarOrdenCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.Success)
                return validationResult;

            var orden = await _ordenRepository.GetByIdAsync(request.Id);
            if (orden == null) return CommandResult.Fail($"La orden con Id {request.Id} no existe.");

            orden.Finalizar();
            bool saved = await _ordenRepository.UnitOfWork.SaveEntitiesAsync(cancellationToken);
            if (!saved) return CommandResult.Fail("Error al finalizar la orden.");

            return CommandResult.Ok("Orden finalizada correctamente.");
        }
    }
}
