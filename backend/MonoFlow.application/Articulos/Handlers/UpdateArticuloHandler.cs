using MonoFlow.application.Articulos.Commands;
using MonoFlow.application.Common;
using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Articulos.Handlers
{
    public class UpdateArticuloHandler : IRequestHandler<UpdateArticuloCommand, CommandResult<Articulo>>
    {
        private readonly IArticuloRepository _articuloRepository;
        private readonly IOperacionRepository _operacionRepository;
        private readonly ICommandValidator<UpdateArticuloCommand> _validator;

        public UpdateArticuloHandler(IArticuloRepository articuloRepository, IOperacionRepository operacionRepository, ICommandValidator<UpdateArticuloCommand> validator)
        {
            _articuloRepository = articuloRepository;
            _operacionRepository = operacionRepository;
            _validator = validator;
        }

        public async Task<CommandResult<Articulo>> Handle(UpdateArticuloCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.Success)
                return CommandResult<Articulo>.Fail(validationResult.Message);

            var articulo = await _articuloRepository.GetByIdAsync(request.Id);
            if (articulo == null)
                return CommandResult<Articulo>.Fail($"No se encontró el artículo con Id {request.Id}");

            int oldCantidad = articulo.Cantidad;
            articulo.UpdateDetails(request.Cantidad, request.Descripcion, request.InicioPlan, request.FinPlan);
            
            if (oldCantidad != request.Cantidad)
            {
                var operaciones = await _operacionRepository.GetByArticuloIdAsync(articulo.Id);
                foreach (var op in operaciones)
                {
                    op.UpdateDetails(null, null, request.Cantidad);
                }
            }

            var saved = await _articuloRepository.UnitOfWork.SaveEntitiesAsync(cancellationToken);
            if (!saved)
                return CommandResult<Articulo>.Fail("Error al actualizar el artículo.");

            return CommandResult<Articulo>.Ok(articulo, "Artículo actualizado correctamente.");
        }
    }
}
