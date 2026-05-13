using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Eventos;
using MonoFlow.domain.Aggregates.Incidencias;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Operarios;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Aggregates.Producciones;
using MonoFlow.domain.Aggregates.ProduccionesRechazadas;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.domain.Aggregates.SesionesOperarios;
using MonoFlow.domain.Aggregates.TiposEvento;
using MonoFlow.domain.Aggregates.TiposIncidencia;
using MonoFlow.domain.Aggregates.TiposOperacion;
using MonoFlow.domain.Aggregates.TiposRechazo;
using MonoFlow.domain.Aggregates.Common;
using System;

namespace MonoFlow.domain.Aggregates.SesionesOperarios
{
    public class SesionOperario : Entity, IAggregateRoot
    {
        public Guid IdRegistro { get; private set; }
        public Guid IdOperario { get; private set; }
        public DateTime Inicio { get; private set; }
        public DateTime? Fin { get; private set; }

        public virtual Operario Operario { get; private set; } = null!;

        protected SesionOperario() { }

        public SesionOperario(Guid idRegistro, Guid idOperario)
        {
            IdRegistro = idRegistro;
            IdOperario = idOperario;
            Inicio = DateTime.Now;
        }

        public void Finalizar()
        {
            if (Fin.HasValue)
                throw new InvalidOperationException("La sesión ya está finalizada.");

            Fin = DateTime.Now;
        }
    }
}

