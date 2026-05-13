using System;
using System.Collections.Generic;

namespace MonoFlow.application.Operaciones.DTOs
{
    public class RegistroTrabajoDTO
    {
        public Guid Id { get; set; }
        public Guid IdOperacion { get; set; }
        public DateTime Inicio { get; set; }
        public DateTime? Fin { get; set; }
        public bool Finalizado { get; set; }
        public string? Observaciones { get; set; }
        public int TotalProducidoOk { get; set; }
        public int TotalRechazado { get; set; }
    }
}
