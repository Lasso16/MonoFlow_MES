using MonoFlow.application.Operaciones.Commands;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Articulos;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operaciones.Handlers
{
    public class UpdateOperacionHandler : IRequestHandler<UpdateOperacionCommand, Operacion?>
    {
        private readonly IOperacionRepository _operacionRepository;
        private readonly IArticuloRepository _articuloRepository;

        public UpdateOperacionHandler(IOperacionRepository operacionRepository, IArticuloRepository articuloRepository)
        {
            _operacionRepository = operacionRepository;
            _articuloRepository = articuloRepository;
        }

        public async Task<Operacion?> Handle(UpdateOperacionCommand request, CancellationToken cancellationToken)
        {
            var op = await _operacionRepository.GetByIdAsync(request.Id);
            if (op == null) return null;

            var articulo = await _articuloRepository.GetByIdAsync(op.IdArticulo);
            if (articulo == null) return null;

            op.UpdateDetails(request.CantidadComponentes, request.TiempoPlan, articulo.Cantidad);
            
            await _operacionRepository.UnitOfWork.SaveEntitiesAsync(cancellationToken);
            return op;
        }
    }
}
