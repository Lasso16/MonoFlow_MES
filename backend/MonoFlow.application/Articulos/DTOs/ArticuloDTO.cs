using MonoFlow.domain.Aggregates.Common;
using System;
using System.Collections.Generic;
using MonoFlow.application.Operaciones.DTOs;

namespace MonoFlow.application.Articulos.DTOs
{
    public class ArticuloDTO
    {
        public Guid Id { get; set; }
        public Guid IdOrden { get; set; }
        public string Referencia { get; set; } = null!;
        public int Linea { get; set; }
        public int Cantidad { get; set; }
        public string? Descripcion { get; set; }
        public DateTime? InicioPlan { get; set; }
        public DateTime? FinPlan { get; set; }
        public int CantidadOperaciones { get; set; }
        public int Progreso { get; set; }
        public EstadoArticulo Estado { get; set; }

        public List<OperacionDTO> Operaciones { get; set; } = new();
    }
}
