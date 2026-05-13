using System;
using System.Collections.Generic;
namespace MonoFlow.application.RegistrosTrabajo.DTOs
{
    public class RegistroTrabajoDTO
    {
        public Guid IdRegistro { get; set; }
        public Guid IdOperacion { get; set; }
        public DateTime Inicio { get; set; }
        public List<string> Operarios { get; set; } = new List<string>();
    }
}
