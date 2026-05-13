using System;
namespace MonoFlow.application.RegistrosTrabajo.DTOs
{
    public class IncidenciaDTO
    {
        public Guid GuidIncidencia { get; set; }
        public int IdTipoIncidencia { get; set; }
        public string NombreTipoIncidencia { get; set; } = string.Empty;
        public string? Comentario { get; set; }
        public Guid? IdOperario { get; set; }
    }
}
