using MonoFlow.domain.Aggregates.Common;
using System;

namespace MonoFlow.domain.Events
{
    public record ArticuloProgresoActualizadoDomainEvent : DomainEvent
    {
        public Guid ArticuloId { get; init; }
        public Guid OrdenId { get; init; }
        public int PorcentajeCompletado { get; init; }

        public ArticuloProgresoActualizadoDomainEvent(Guid articuloId, Guid ordenId, int porcentajeCompletado)
        {
            ArticuloId = articuloId;
            OrdenId = ordenId;
            PorcentajeCompletado = porcentajeCompletado;
        }
    }
}
