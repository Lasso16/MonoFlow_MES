using MonoFlow.domain.Aggregates.Common;
using System;

namespace MonoFlow.domain.Events
{
    public record RegistroTrabajoFinalizadoDomainEvent : DomainEvent
    {
        public Guid OperacionId { get; init; }
        public double HorasTrabajadas { get; init; }
        public bool SinOperarios { get; init; }

        public RegistroTrabajoFinalizadoDomainEvent(Guid operacionId, double horasTrabajadas, bool sinOperarios = false)
        {
            OperacionId = operacionId;
            HorasTrabajadas = horasTrabajadas;
            SinOperarios = sinOperarios;
        }
    }
}