using System;
using MonoFlow.application.Operarios.DTOs;

namespace MonoFlow.application.RegistrosTrabajo.DTOs
{
    public class SesionDTO
    {
        public Guid Id { get; set; }
        public DateTime Inicio { get; set; }
        public DateTime? Fin { get; set; }
        public OperarioDTO Operario { get; set; } = default!;
    }
}
