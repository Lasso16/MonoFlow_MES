using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Events;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.RegistrosTrabajo.DomainEventHandlers
{
    /// <summary>
    /// Escucha ArticuloProgresoActualizadoDomainEvent.
    /// Recalcula el estado de la orden en base a sus operaciones.
    /// </summary>
    public class ActualizarEstadoOrdenHandler
        : INotificationHandler<ArticuloProgresoActualizadoDomainEvent>
    {
        private readonly IOrdenRepository _ordenRepo;

        public ActualizarEstadoOrdenHandler(IOrdenRepository ordenRepo)
        {
            _ordenRepo = ordenRepo;
        }

        public async Task Handle(ArticuloProgresoActualizadoDomainEvent notification, CancellationToken ct)
        {
            var orden = await _ordenRepo.GetByIdAsync(notification.OrdenId);
            if (orden == null) return;

            orden.ActualizarEstadoSegunOperaciones();

            await _ordenRepo.UnitOfWork.SaveEntitiesAsync(ct);
        }
    }
}
