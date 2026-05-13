using System;
namespace MonoFlow.application.RegistrosTrabajo.DTOs
{
    public class RechazoDTO
    {
        public Guid IdRegistro { get; set; }
        public int IdTipoRechazo { get; set; }
        public string NombreTipoRechazo { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public int TotalProducidoOk { get; set; }
        public int TotalRechazado { get; set; }
        public string? Comentario { get; set; }
        public DateTime Timestamp { get; set; }
        public Guid? IdOperario { get; set; }
    }
}
