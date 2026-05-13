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
using System.Collections.Generic;

namespace MonoFlow.domain.Aggregates.Eventos
{
  
    public class Evento : Entity, IAggregateRoot
    {

        public Guid IdRegistro { get; private set; }
        public int IdTipoEvento { get; private set; }
        public DateTime Inicio { get; private set; }
        public DateTime? Fin { get; private set; }

        public virtual TipoEvento? TipoEvento { get; private set; }

        private readonly List<Incidencia> _incidencias = new();
        public IReadOnlyCollection<Incidencia> Incidencias => _incidencias.AsReadOnly();

        private Evento() { }

        public Evento(Guid idRegistro, int idTipoEvento, DateTime inicio)
        {
            IdRegistro = idRegistro;
            IdTipoEvento = idTipoEvento;
            Inicio = inicio;
        }

        public void Finalizar(DateTime fin)
        {
            if (Fin.HasValue)
                throw new InvalidOperationException("El evento ya está finalizado.");

            if (fin < Inicio)
                throw new ArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio.");

            Fin = fin;
        }

        public void AgregarIncidencia(int idTipoIncidencia, string comentario)
        {
            var incidencia = new Incidencia(this.Id, idTipoIncidencia, comentario);
            _incidencias.Add(incidencia);
        }

        public void AjustarTiempos(DateTime nuevoInicio, DateTime? nuevoFin)
        {
            if (nuevoFin.HasValue && nuevoFin < nuevoInicio)
                throw new ArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio.");

            Inicio = nuevoInicio;
            Fin = nuevoFin;
        }

        public void IndicarIncidencia(int idTipoIncidencia, string? comentario)
        {
            _incidencias.Add(new Incidencia(this.Id, idTipoIncidencia, comentario ?? string.Empty));
        }
    }
}

