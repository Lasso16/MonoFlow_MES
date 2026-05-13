using System;

namespace MonoFlow.application.Operaciones.DTOs
{
    public class OperacionProgresoDTO
    {
        public Guid Id { get; set; }
        public int CantidadReal { get; set; }
        public double TiempoReal { get; set; }
    }
}
