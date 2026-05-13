using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Events;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.RegistrosTrabajo.DomainEventHandlers
{
    /// <summary>
    /// Escucha los domain events de RegistroTrabajo y actualiza el estado de la Operacion
    /// usando IOperacionRepository directamente (no navega por IOrdenRepository).
    /// </summary>
    public class ActualizarEstadoOperacionHandler
    : INotificationHandler<ProduccionRegistradaDomainEvent>,
      INotificationHandler<RechazoRegistradoDomainEvent>,
      INotificationHandler<RegistroTrabajoFinalizadoDomainEvent>,
      INotificationHandler<EventoIniciadoDomainEvent>,
      INotificationHandler<EventoFinalizadoDomainEvent>
    {
        private readonly IOperacionRepository _operacionRepo;
                private readonly IArticuloRepository _articuloRepo;
        private readonly IOrdenRepository _ordenRepo;

                public ActualizarEstadoOperacionHandler(IOperacionRepository operacionRepo, IArticuloRepository articuloRepo, IOrdenRepository ordenRepo)
        {
            _operacionRepo = operacionRepo;
                        _articuloRepo = articuloRepo;
            _ordenRepo = ordenRepo;
        }

        public async Task Handle(EventoIniciadoDomainEvent notification, CancellationToken ct)
        {
            var operacion = await _operacionRepo.GetByIdAsync(notification.OperacionId);
            if (operacion != null)
            {
                operacion.ProcesarInicioEvento(notification.TipoEventoId, notification.FechaInicio);
                await ActualizarEstadoArticuloDesdeOperacion(notification.OperacionId);
                await ActualizarEstadoOrdenDesdeOperacion(notification.OperacionId);
                await _operacionRepo.UnitOfWork.SaveEntitiesAsync(ct);
            }
        }

        public async Task Handle(EventoFinalizadoDomainEvent notification, CancellationToken ct)
        {
            var operacion = await _operacionRepo.GetByIdAsync(notification.OperacionId);
            if (operacion != null)
            {
                operacion.ProcesarFinEvento(notification.TipoEventoId, notification.FechaFin);
                await ActualizarEstadoArticuloDesdeOperacion(notification.OperacionId);
                await ActualizarEstadoOrdenDesdeOperacion(notification.OperacionId);
                // Si ProcesarFinEvento dispara OperacionFinalizadaDomainEvent,
                // se procesara en la siguiente llamada a SaveEntitiesAsync
                await _operacionRepo.UnitOfWork.SaveEntitiesAsync(ct);
            }
        }

        public async Task Handle(RegistroTrabajoFinalizadoDomainEvent notification, CancellationToken ct)
        {
            var operacion = await _operacionRepo.GetByIdWithRegistrosAsync(notification.OperacionId);
            if (operacion != null)
            {
                operacion.AcumularTiempoReal(notification.HorasTrabajadas);
                operacion.EvaluarPasoADetenido();
                await ActualizarEstadoArticuloDesdeOperacion(notification.OperacionId);
                await ActualizarEstadoOrdenDesdeOperacion(notification.OperacionId);
                await _operacionRepo.UnitOfWork.SaveEntitiesAsync(ct);
            }
        }

        public async Task Handle(ProduccionRegistradaDomainEvent notification, CancellationToken ct)
            => await ProcesarCambioProduccion(notification.OperacionId, notification.OccurredOn, ct);

        public async Task Handle(RechazoRegistradoDomainEvent notification, CancellationToken ct)
            => await ProcesarCambioProduccion(notification.OperacionId, notification.OccurredOn, ct);

        private async Task ProcesarCambioProduccion(Guid operacionId, DateTime fecha, CancellationToken ct)
        {
            // Cargamos la operacion con sus registros para poder evaluar produccion total
            var operacion = await _operacionRepo.GetByIdWithRegistrosAsync(operacionId);
            if (operacion != null)
            {
                operacion.EvaluarEstadoTrasProduccion(fecha);
                await ActualizarEstadoArticuloDesdeOperacion(operacionId);
                await ActualizarEstadoOrdenDesdeOperacion(operacionId);
                // Si EvaluarEstadoTrasProduccion dispara OperacionFinalizadaDomainEvent,
                // se procesara en la siguiente llamada a SaveEntitiesAsync
                await _operacionRepo.UnitOfWork.SaveEntitiesAsync(ct);
            }
        }

        private async Task ActualizarEstadoArticuloDesdeOperacion(Guid operacionId)
        {
            var operacion = await _operacionRepo.GetByIdAsync(operacionId);
            if (operacion == null)
            {
                return;
            }

            var articulo = await _articuloRepo.GetByIdWithOperacionesAsync(operacion.IdArticulo);
            if (articulo == null)
            {
                return;
            }

            articulo.ActualizarEstado();
        }

        private async Task ActualizarEstadoOrdenDesdeOperacion(Guid operacionId)
        {
            var orden = await _ordenRepo.GetOrdenByOperacionIdAsync(operacionId);
            if (orden == null)
            {
                return;
            }

            orden.ActualizarEstadoSegunOperaciones();
        }
    }
}