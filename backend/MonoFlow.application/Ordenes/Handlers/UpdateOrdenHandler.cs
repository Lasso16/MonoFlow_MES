using MonoFlow.application.Common;
using MonoFlow.application.Ordenes.Commands;
using MonoFlow.domain.Aggregates.Ordenes;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Ordenes.Handlers
{
    public class UpdateOrdenHandler : IRequestHandler<UpdateOrdenCommand, CommandResult>
    {
        private readonly IOrdenRepository _ordenRepository;
        private readonly ICommandValidator<UpdateOrdenCommand> _validator;

        public UpdateOrdenHandler(IOrdenRepository ordenRepository, ICommandValidator<UpdateOrdenCommand> validator)
        {
            _ordenRepository = ordenRepository;
            _validator = validator;
        }

        public async Task<CommandResult> Handle(UpdateOrdenCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.Success)
                return validationResult;

            var orden = await _ordenRepository.GetByIdAsync(request.Id);
            if (orden == null) return CommandResult.Fail($"La orden con Id {request.Id} no existe.");

            orden.ActualizarDatos(request.Descripcion, request.Cliente, request.CodigoProcedencia);

            bool saved = await _ordenRepository.UnitOfWork.SaveEntitiesAsync(cancellationToken);
            if (!saved) return CommandResult.Fail("Error al guardar la actualización de la orden.");

            return CommandResult.Ok("Orden actualizada correctamente.");
        }
    }
}
