using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Events;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.RegistrosTrabajo.DomainEventHandlers
{
    public class ActualizarProgresoArticuloHandler
        : INotificationHandler<OperacionFinalizadaDomainEvent>
    {
        private readonly IArticuloRepository _articuloRepo;

        public ActualizarProgresoArticuloHandler(IArticuloRepository articuloRepo)
        {
            _articuloRepo = articuloRepo;
        }

        public async Task Handle(OperacionFinalizadaDomainEvent notification, CancellationToken ct)
        {
            var articulo = await _articuloRepo.GetByIdWithOperacionesAsync(notification.ArticuloId);
            if (articulo == null) return;

            articulo.ActualizarEstado();
            int progreso = articulo.CalcularPorcentajeCompletado();

            articulo.AddDomainEvent(new ArticuloProgresoActualizadoDomainEvent(
                articulo.Id, 
                articulo.IdOrden, 
                progreso));

            await _articuloRepo.UnitOfWork.SaveEntitiesAsync(ct);
        }
    }
}
