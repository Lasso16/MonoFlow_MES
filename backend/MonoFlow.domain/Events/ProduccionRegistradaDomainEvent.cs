using MonoFlow.domain.Aggregates.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace MonoFlow.domain.Events
{
    public record ProduccionRegistradaDomainEvent : DomainEvent
    {
        public Guid OperacionId { get; init; }
        public Cantidad CantidadOk { get; init; }

        public ProduccionRegistradaDomainEvent(Guid operacionId, Cantidad cantidadOk)
        {
            OperacionId = operacionId;
            CantidadOk = cantidadOk;
        }
    }
}
