using System;

namespace MonoFlow.application.RegistrosTrabajo.DTOs
{
    public class RegistroActivoOperarioDTO
    {
        public Guid IdRegistro { get; set; }
        public Guid IdOperacion { get; set; }
        public DateTime InicioRegistro { get; set; }
        public DateTime InicioSesionOperario { get; set; }
    }
}