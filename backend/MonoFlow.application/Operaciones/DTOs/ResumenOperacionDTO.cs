using System;
using System.Collections.Generic;

namespace MonoFlow.application.Operaciones.DTOs
{
    public class DetalleSesionDTO
    {
        public string NombreOperario { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
        public DateTime Inicio { get; set; }
        public DateTime? Fin { get; set; }
        public int NumeroOperario { get; set; }
    }

    public class DetalleProduccionDTO
    {
        public int CantidadOk { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class DetalleRegistroDTO
    {
        public Guid RegistroId { get; set; }
        public DateTime Inicio { get; set; }
        public DateTime? Fin { get; set; }
        public bool Finalizado { get; set; }
        public string? Observaciones { get; set; }
        public List<DetalleSesionDTO> Operarios { get; set; } = new();
        public List<DetalleProduccionDTO> Producciones { get; set; } = new();
        public List<ResumenIncidenciaDTO> Incidencias { get; set; } = new();
        public List<ResumenRechazoDTO> Rechazos { get; set; } = new();
    }

    public class ResumenIncidenciaDTO
    {
        public string TipoIncidencia { get; set; } = string.Empty;
        public string Comentario { get; set; } = string.Empty;
        public DateTime Inicio { get; set; }
        public DateTime? Fin { get; set; }
        public double DuracionMinutos { get; set; }
    }

    public class ResumenRechazoDTO
    {
        public string Tipo { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public string Comentario { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    public class ResumenOperacionDTO
    {
        public Guid OperacionId { get; set; }
        public string Cliente { get; set; } = string.Empty;
        public string DescripcionArticulo { get; set; } = string.Empty;
        public int CantidadTotal { get; set; }
        public int UnidadesFabricadas { get; set; }
        public string TipoOperacion { get; set; } = string.Empty;
        public double? TiempoPlanificado { get; set; }
        public double TiempoTotal { get; set; }
        public DateTime? Inicio { get; set; }
        public DateTime? Fin { get; set; }


        public double TiempoTrabajo { get; set; }
        public double TiempoEfectivo { get; set; }
        public double TiempoPausa { get; set; }
        public double TiempoIncidencia { get; set; }
        public double TiempoPreparacion { get; set; }
        public double TiempoRecogida { get; set; }

        public List<DetalleRegistroDTO> DetalleRegistros { get; set; } = new();
    }
}
