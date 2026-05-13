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

namespace MonoFlow.domain.Aggregates.Incidencias
{
    public class Incidencia : Entity, IAggregateRoot
    {
        public Guid IdEvento { get; private set; }
        public int IdTipoIncidencia { get; private set; }
        public string Comentario { get; private set; } = null!;
        public virtual TipoIncidencia? TipoIncidencia { get; private set; }

        private Incidencia() { }

        public Incidencia(Guid idEvento, int idTipoIncidencia, string comentario)
        {
            if (string.IsNullOrWhiteSpace(comentario))
                throw new ArgumentException("El comentario no puede estar vacío.", nameof(comentario));

            this.IdEvento = idEvento;
            this.IdTipoIncidencia = idTipoIncidencia;
            this.Comentario = comentario;
        }
    }
}

