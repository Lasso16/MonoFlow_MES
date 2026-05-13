using System;

namespace MonoFlow.application.Operaciones.DTOs
{
    public class TipoOperacionDTO
    {
        public int Id { get; set; }
        public string Tipo { get; set; } = null!;
        public string? Descripcion { get; set; }
    }
}
