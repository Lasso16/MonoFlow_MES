using System;

namespace MonoFlow.application.Operarios.DTOs
{
    public class OperarioDTO
    {
        public Guid Id { get; set; }
        public int NumeroOperario { get; set; }
        public string Nombre { get; set; } = null!;
        public bool Activo { get; set; }
        public string Rol { get; set; } = null!;
    }
}
