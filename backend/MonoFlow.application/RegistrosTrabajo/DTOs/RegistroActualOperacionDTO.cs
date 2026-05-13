using System;
using System.Collections.Generic;
using MonoFlow.application.Operarios.DTOs;

namespace MonoFlow.application.RegistrosTrabajo.DTOs
{
    public class RegistroActualOperacionDTO
    {
        public Guid IdRegistro { get; set; }
        public Guid IdOperacion { get; set; }
        public DateTime Inicio { get; set; }
        public DateTime? Fin { get; set; }
        public bool Finalizado { get; set; }
        public string? Observaciones { get; set; }
        public int TotalProducidoOk { get; set; }
        public int TotalRechazado { get; set; }
        public List<SesionDTO> SesionesActivas { get; set; } = new List<SesionDTO>();
        public List<ProduccionDTO> Producciones { get; set; } = new List<ProduccionDTO>();
        public List<RechazoDTO> Rechazos { get; set; } = new List<RechazoDTO>();
        public List<EventoDTO> Eventos { get; set; } = new List<EventoDTO>();
    }
}