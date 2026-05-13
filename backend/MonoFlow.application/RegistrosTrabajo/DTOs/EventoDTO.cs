using System;
using System.Collections.Generic;
namespace MonoFlow.application.RegistrosTrabajo.DTOs
{
    public class EventoDTO
    {
        public Guid IdEvento { get; set; }
        public int IdTipoEvento { get; set; }
        public string NombreTipoEvento { get; set; } = string.Empty;
        public DateTime Inicio { get; set; }
        public DateTime? Fin { get; set; }
        public Guid? IdOperario { get; set; }
        public List<IncidenciaDTO> Incidencias { get; set; } = new List<IncidenciaDTO>();
    }
}
