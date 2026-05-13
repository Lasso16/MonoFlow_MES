using System;
using System.Collections.Generic;
using System.Text;

using MonoFlow.domain.Aggregates.Common;

namespace MonoFlow.domain.Events
{
    public class EventoFinalizadoDomainEvent : IDomainEvent
    {
        public Guid OperacionId { get; }
        public int TipoEventoId { get; }
        public DateTime FechaFin { get; }

        public DateTime OccurredOn { get; init; } = DateTime.Now;

        public EventoFinalizadoDomainEvent(Guid operacionId, int tipoEventoId, DateTime fechaFin)
        {
            OperacionId = operacionId;
            TipoEventoId = tipoEventoId;
            FechaFin = fechaFin;
        }
    }
}
