using MonoFlow.application.Articulos.Commands;
using MonoFlow.application.Common;
using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Articulos.Handlers
{
    public class DeleteArticuloHandler : IRequestHandler<DeleteArticuloCommand, CommandResult>
    {
        private readonly IArticuloRepository _articuloRepository;
        private readonly IRegistroTrabajoRepository _registroTrabajoRepository;
        private readonly ICommandValidator<DeleteArticuloCommand> _validator;

        public DeleteArticuloHandler(
            IArticuloRepository articuloRepository,
            IRegistroTrabajoRepository registroTrabajoRepository,
            ICommandValidator<DeleteArticuloCommand> validator)
        {
            _articuloRepository = articuloRepository;
            _registroTrabajoRepository = registroTrabajoRepository;
            _validator = validator;
        }

        public async Task<CommandResult> Handle(DeleteArticuloCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.Success)
                return validationResult;

            var articulo = await _articuloRepository.GetByIdAsync(request.Id);
            if (articulo == null)
                return CommandResult.Fail("El artículo no existe.");

            var tieneRegistros = await _registroTrabajoRepository.HasRegistrosByArticuloAsync(articulo.Id);
            if (tieneRegistros)
                return CommandResult.Fail("No se puede borrar el artículo porque tiene registros de trabajo asociados.");

            await _articuloRepository.DeleteAsync(articulo);
            bool saved = await _articuloRepository.UnitOfWork.SaveEntitiesAsync(cancellationToken);

            if (!saved)
                return CommandResult.Fail("Error al eliminar el artículo.");

            return CommandResult.Ok("Artículo eliminado correctamente.");
        }
    }
}
