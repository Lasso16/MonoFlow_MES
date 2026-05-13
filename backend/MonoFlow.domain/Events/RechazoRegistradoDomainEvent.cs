using MonoFlow.domain.Aggregates.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace MonoFlow.domain.Events
{
    public record RechazoRegistradoDomainEvent : DomainEvent
    {
        public Guid OperacionId { get; init; }
        public Cantidad CantidadRechazada { get; init; }

        public RechazoRegistradoDomainEvent(Guid operacionId, Cantidad cantidad)
        {
            OperacionId = operacionId;
            CantidadRechazada = cantidad;
        }
    }
}
