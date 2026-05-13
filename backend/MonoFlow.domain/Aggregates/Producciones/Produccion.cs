using MonoFlow.domain.Aggregates.Common;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MonoFlow.domain.Aggregates.Producciones
{
    public class Produccion : Entity, IAggregateRoot
    {
        public Guid IdRegistro { get; private set; }
        public DateTime Timestamp { get; private set; }
        public Cantidad CantidadOk { get; private set; }       

        private Produccion() { }

        public Produccion(Guid idRegistro, Cantidad cantidadOk)
        {
            if (cantidadOk < 0)
                throw new ArgumentException("La cantidad OK no puede ser negativa.", nameof(cantidadOk));

            IdRegistro = idRegistro;
            CantidadOk = cantidadOk;
            Timestamp = DateTime.Now;
        }
    }
}
