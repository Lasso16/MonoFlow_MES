using System;
namespace MonoFlow.application.RegistrosTrabajo.DTOs
{
    public class ProduccionDTO
    {
        public Guid IdRegistro { get; set; }
        public int Cantidad { get; set; }
        public int TotalProducidoOk { get; set; }
        public int TotalRechazado { get; set; }
        public DateTime Timestamp { get; set; }
        public Guid? IdOperario { get; set; }
    }
}
