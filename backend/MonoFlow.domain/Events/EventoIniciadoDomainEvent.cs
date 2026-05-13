using System;
using System.Collections.Generic;
using System.Text;
using MonoFlow.domain.Aggregates.Common;

namespace MonoFlow.domain.Events
{
    public class EventoIniciadoDomainEvent : IDomainEvent
    {
        public Guid OperacionId { get; }
        public int TipoEventoId { get; }
        public DateTime FechaInicio { get; }

        public DateTime OccurredOn { get; init; } = DateTime.Now;

        public EventoIniciadoDomainEvent(Guid operacionId, int tipoEventoId, DateTime fechaInicio)
        {
            OperacionId = operacionId;
            TipoEventoId = tipoEventoId;
            FechaInicio = fechaInicio;
        }
    }
}