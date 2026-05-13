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
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Events;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MonoFlow.domain.Aggregates.RegistrosTrabajo
{
    public class RegistroTrabajo : Entity, IAggregateRoot
    {
        public Guid IdOperacion { get; private set; }
        public DateTime Inicio { get; private set; }
        public DateTime? Fin { get; private set; }
        public bool Finalizado { get; private set; }
        public string? Observaciones { get; private set; }

        private readonly List<SesionOperario> _sesiones = new();
        public IReadOnlyCollection<SesionOperario> Sesiones => _sesiones.AsReadOnly();

        private readonly List<Evento> _eventos = new();
        public IReadOnlyCollection<Evento> Eventos => _eventos.AsReadOnly();

        private readonly List<Produccion> _producciones = new();
        public IReadOnlyCollection<Produccion> Producciones => _producciones.AsReadOnly();

        private readonly List<Rechazo> _rechazos = new();
        public IReadOnlyCollection<Rechazo> Rechazos => _rechazos.AsReadOnly();

        public Cantidad TotalProducidoOk { get; private set; }
        public Cantidad TotalRechazado { get; private set; }

        private RegistroTrabajo() { }

        private RegistroTrabajo(Guid idOperacion)
        {
            IdOperacion = idOperacion;
            Finalizado = false;
            Inicio = DateTime.Now;

            TotalProducidoOk = 0;
            TotalRechazado = 0;
            RegistrarEvento(1);
        }

        public static RegistroTrabajo Create(Guid idOperacion, List<Guid> operarios)
        {
            var registro = new RegistroTrabajo(idOperacion);

            foreach (var operario in operarios)
            {
                registro.AbrirSesion(operario);
            }

            return registro;
        }

        public Evento RegistrarEvento(int idTipoEvento)
        {
            if (Finalizado)
                throw new InvalidOperationException("No se pueden registrar eventos en un registro finalizado.");

            var eventoActivo = ObtenerEventoActivoUnico();

            if (eventoActivo != null && eventoActivo.IdTipoEvento == idTipoEvento)
                throw new InvalidOperationException("Ya existe un evento activo de ese tipo.");

            if (EsEventoNatural(idTipoEvento) && !PuedeRegistrarEventoNatural(eventoActivo, idTipoEvento))
                throw new InvalidOperationException("No se puede volver a un evento anterior.");

            DateTime ahora = DateTime.Now;

            if (eventoActivo != null)
            {
                eventoActivo.Finalizar(ahora);
                this.AddDomainEvent(new EventoFinalizadoDomainEvent(this.IdOperacion, eventoActivo.IdTipoEvento, ahora));
            }

            var nuevoEvento = new Evento(this.Id, idTipoEvento, ahora);
            _eventos.Add(nuevoEvento);

            this.AddDomainEvent(new EventoIniciadoDomainEvent(this.IdOperacion, idTipoEvento, ahora));

            return nuevoEvento;
        }

        private static bool EsEventoNatural(int idTipoEvento)
            => idTipoEvento == TiposEventoEstandar.Preparacion
               || idTipoEvento == TiposEventoEstandar.Ejecucion
               || idTipoEvento == TiposEventoEstandar.Recogida;

        private static int ObtenerOrdenEventoNatural(int idTipoEvento)
        {
            return idTipoEvento switch
            {
                TiposEventoEstandar.Preparacion => 1,
                TiposEventoEstandar.Ejecucion => 2,
                TiposEventoEstandar.Recogida => 3,
                _ => 0,
            };
        }

        private int ObtenerUltimoEventoNaturalRegistrado()
        {
            var ultimoEventoNatural = _eventos.LastOrDefault(e =>
                e.IdTipoEvento == TiposEventoEstandar.Preparacion ||
                e.IdTipoEvento == TiposEventoEstandar.Ejecucion ||
                e.IdTipoEvento == TiposEventoEstandar.Recogida);

            return ultimoEventoNatural == null ? 0 : ObtenerOrdenEventoNatural(ultimoEventoNatural.IdTipoEvento);
        }

        private bool PuedeRegistrarEventoNatural(Evento? eventoActivo, int idTipoEvento)
        {
            var ordenSolicitado = ObtenerOrdenEventoNatural(idTipoEvento);
            var ordenUltimoNatural = ObtenerUltimoEventoNaturalRegistrado();

            if (eventoActivo == null)
                return ordenSolicitado >= ordenUltimoNatural;

            if (eventoActivo.IdTipoEvento == TiposEventoEstandar.Pausa || eventoActivo.IdTipoEvento == TiposEventoEstandar.Incidencia)
                return ordenSolicitado >= ordenUltimoNatural;

            return ordenSolicitado >= ObtenerOrdenEventoNatural(eventoActivo.IdTipoEvento);
        }

        public void RegistrarIncidencia(int idTipoIncidencia, string? comentario)
        {
            if (Finalizado) throw new InvalidOperationException("Registro cerrado.");

            ObtenerEventoActivoUnico();

            const int ID_TIPO_EVENTO_INCIDENCIA = TiposEventoEstandar.Incidencia;

            var eventoActual = _eventos.FirstOrDefault(e => !e.Fin.HasValue && e.IdTipoEvento == ID_TIPO_EVENTO_INCIDENCIA);
            if (eventoActual == null)
            {
                RegistrarEvento(ID_TIPO_EVENTO_INCIDENCIA);
                eventoActual = _eventos.FirstOrDefault(e => !e.Fin.HasValue && e.IdTipoEvento == ID_TIPO_EVENTO_INCIDENCIA);
            }

            if (eventoActual != null)
            {
                eventoActual.IndicarIncidencia(idTipoIncidencia, comentario);
            }
        }

        public void RegistrarProduccion(Cantidad cantidad)
        {
            if (Finalizado) throw new InvalidOperationException("Registro cerrado.");

            var eventoActivo = ObtenerEventoActivoUnico();
            if (eventoActivo == null || eventoActivo.IdTipoEvento != TiposEventoEstandar.Ejecucion)
                throw new InvalidOperationException("Solo se puede registrar producción durante el evento de ejecución.");

            _producciones.Add(new Produccion(this.Id, cantidad));
            TotalProducidoOk += cantidad;
            this.AddDomainEvent(new ProduccionRegistradaDomainEvent(this.IdOperacion, cantidad));
        }

        public void RegistrarRechazo(Cantidad cantidad, int idTipoRechazo, string comentario)
        {
            if (Finalizado) throw new InvalidOperationException("Registro cerrado.");

            var eventoActivo = ObtenerEventoActivoUnico();
            if (eventoActivo == null || eventoActivo.IdTipoEvento != TiposEventoEstandar.Ejecucion)
                throw new InvalidOperationException("Solo se puede registrar rechazo durante el evento de ejecución.");

            _rechazos.Add(new Rechazo(this.Id, idTipoRechazo, cantidad, comentario));
            TotalRechazado += cantidad;
            this.AddDomainEvent(new RechazoRegistradoDomainEvent(this.IdOperacion, cantidad));
        }

        public void Finalizar(bool sinOperarios = false)
        {
            if (Finalizado) return;

            this.Fin = DateTime.Now;
            this.Finalizado = true;

            foreach (var sesion in _sesiones.Where(s => !s.Fin.HasValue))
            {
                sesion.Finalizar();
            }

            foreach (var evento in _eventos.Where(e => !e.Fin.HasValue))
            {
                evento.Finalizar(this.Fin.Value);
            }

            double horas = (this.Fin.Value - this.Inicio).TotalHours;
            this.AddDomainEvent(new RegistroTrabajoFinalizadoDomainEvent(this.IdOperacion, horas, sinOperarios));
        }

        public void AbrirSesion(Guid operarioId)
        {
            if (Finalizado)
                throw new InvalidOperationException("No se pueden abrir sesiones en un registro finalizado.");

            if (_sesiones.Any(s => s.IdOperario == operarioId && s.Fin == null))
                throw new Exception("El operario ya tiene una sesión activa en esta operación.");

            var nuevaSesion = new SesionOperario(this.Id, operarioId);
            _sesiones.Add(nuevaSesion);
        }

        public void CerrarSesion(Guid operarioId)
        {
            var sesion = _sesiones.FirstOrDefault(s => s.IdOperario == operarioId && !s.Fin.HasValue);

            if (sesion == null)
                throw new Exception("No se ha encontrado una sesión activa para este operario en este registro.");

            sesion.Finalizar();

            bool quedanOperariosActivos = _sesiones.Any(s => !s.Fin.HasValue);

            if (!quedanOperariosActivos)
            {
                this.Finalizar(true);
            }
        }

        public void AgregarObservacion(string nuevaObservacion)
        {
            if (string.IsNullOrWhiteSpace(nuevaObservacion))
                throw new ArgumentException("La observación no puede estar vacía.", nameof(nuevaObservacion));

            if (string.IsNullOrWhiteSpace(Observaciones))
            {
                Observaciones = $"[{DateTime.Now:dd/MM HH:mm}]: {nuevaObservacion}";
            }
            else
            {
                Observaciones += $"\n[{DateTime.Now:dd/MM HH:mm}]: {nuevaObservacion}";
            }
        }

        public double TiempoTrabajado()
        {
            if (!Fin.HasValue) return 0;
            return (Fin.Value - Inicio).TotalHours;
        }

        private Evento? ObtenerEventoActivoUnico()
        {
            var eventosActivos = _eventos
                .Where(e => !e.Fin.HasValue)
                .OrderBy(e => e.Inicio)
                .ToList();

            if (eventosActivos.Count <= 1)
                return eventosActivos.FirstOrDefault();

            var eventoMasReciente = eventosActivos[^1];

            foreach (var evento in eventosActivos.Take(eventosActivos.Count - 1))
            {
                evento.Finalizar(eventoMasReciente.Inicio);
                this.AddDomainEvent(new EventoFinalizadoDomainEvent(this.IdOperacion, evento.IdTipoEvento, eventoMasReciente.Inicio));
            }

            return eventoMasReciente;
        }
    }
}
