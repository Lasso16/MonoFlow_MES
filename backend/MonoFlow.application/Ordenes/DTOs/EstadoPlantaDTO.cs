using System;
using System.Collections.Generic;

namespace MonoFlow.application.Ordenes.DTOs
{
    public class EstadoPlantaOrdenDTO
    {
        public Guid IdOrden { get; set; }
        public string IdNavision { get; set; } = string.Empty;
        public string? Cliente { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public int Progreso { get; set; }
        public List<EstadoPlantaArticuloDTO> Articulos { get; set; } = new();
    }

    public class EstadoPlantaArticuloDTO
    {
        public Guid IdArticulo { get; set; }
        public string Referencia { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public string? Descripcion { get; set; }
        public DateTime? InicioPlan { get; set; }
        public DateTime? FinPlan { get; set; }
        public string Estado { get; set; } = string.Empty;
        public int Progreso { get; set; }
        public List<EstadoPlantaOperacionDTO> Operaciones { get; set; } = new();
    }

    public class EstadoPlantaOperacionDTO
    {
        public Guid IdOperacion { get; set; }
        public string TipoOperacion { get; set; } = string.Empty;
        public int CantidadTotal { get; set; }
        public string Estado { get; set; } = string.Empty;
        public List<EstadoPlantaRegistroDTO> Registros { get; set; } = new();
    }

    public class EstadoPlantaRegistroDTO
    {
        public Guid IdRegistro { get; set; }
        public DateTime Inicio { get; set; }
        public int TotalProducidoOk { get; set; }
        public int TotalRechazado { get; set; }
        public List<EstadoPlantaOperarioDTO> Operarios { get; set; } = new();
    }

    public class EstadoPlantaOperarioDTO
    {
        public Guid IdOperario { get; set; }
        public int NumeroOperario { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
        public DateTime InicioSesion { get; set; }
    }
}