using MonoFlow.domain.Aggregates.Common;
using System;

namespace MonoFlow.application.Operaciones.DTOs
{
    public class OperacionDTO
    {
        public Guid Id { get; set; }
        public Guid IdArticulo { get; set; }
        public int IdTipoOperacion { get; set; }
        public string TipoOperacion { get; set; } = null!; 
        public int CantidadTotal { get; set; }
        public int CantidadProducida { get; set; }
        public int CantidadRechazada { get; set; }
        public int? CantidadComponentes { get; set; }
        public double? TiempoPlan { get; set; }
        public double TiempoTotal { get; set; }
        public EstadoOperacion? Estado { get; set; }
        public DateTime? Inicio { get; set; }
        public DateTime? Fin { get; set; }
        public bool UltimaOperacion { get; set; }
        public double Progreso { get; set; }
    }
}

