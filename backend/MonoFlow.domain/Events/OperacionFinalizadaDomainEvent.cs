using MonoFlow.domain.Aggregates.Common;
using System;

namespace MonoFlow.domain.Events
{
    public record OperacionFinalizadaDomainEvent : DomainEvent
    {
        public Guid OperacionId { get; init; }
        public Guid ArticuloId { get; init; }

        public OperacionFinalizadaDomainEvent(Guid operacionId, Guid articuloId)
        {
            OperacionId = operacionId;
            ArticuloId = articuloId;
        }
    }
}
