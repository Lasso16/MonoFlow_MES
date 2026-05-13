using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.TiposRechazo;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MonoFlow.domain.Aggregates.ProduccionesRechazadas
{
    public class Rechazo : Entity, IAggregateRoot
    {
        public Guid IdRegistro { get; private set; }  
        public int IdTipoRechazo { get; private set; }
        public virtual TipoRechazo? TipoRechazo { get; private set; }
        public Cantidad CantidadRechazo { get; private set; }
        public string? Comentario { get; private set; }
        public DateTime Timestamp { get; private set; }
        private Rechazo() { }

        public Rechazo(Guid idRegistro, int idTipoRechazo, Cantidad cantidadRechazo, string? comentario = null)
        {
            if (cantidadRechazo <= 0)
                throw new ArgumentException("La cantidad rechazada debe ser mayor a cero.", nameof(cantidadRechazo));

            IdRegistro = idRegistro;
            IdTipoRechazo = idTipoRechazo;
            CantidadRechazo = cantidadRechazo;
            Comentario = comentario;
            Timestamp = DateTime.Now;
        }
    }
}
