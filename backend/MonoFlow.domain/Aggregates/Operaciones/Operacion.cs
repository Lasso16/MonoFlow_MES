using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.domain.Aggregates.TiposEvento;
using MonoFlow.domain.Aggregates.TiposOperacion;
using MonoFlow.domain.Events;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MonoFlow.domain.Aggregates.Operaciones
{

    public class Operacion : Entity, IAggregateRoot
    {

        public Guid IdArticulo { get; private set; }
        public int IdTipoOperacion { get; private set; }
        public virtual TipoOperacion? TipoOperacion { get; private set; }
        public Cantidad? CantidadComponentes { get; private set; }
        public Cantidad CantidadTotal { get; private set; }
        public double? TiempoPlan { get; private set; }
        public double TiempoTotal { get; private set; }
        public bool UltimaOperacion { get; private set; }
        public EstadoOperacion? Estado { get; private set; }

        public DateTime? Inicio { get; private set; }
        public DateTime? Fin { get; private set; }

        private readonly List<RegistroTrabajo> _registros = new();
        public IReadOnlyCollection<RegistroTrabajo> Registros => _registros.AsReadOnly();

        private Operacion() { }

        public Operacion(Guid idArticulo, int idTipoOperacion, Cantidad cantidadTotal, double? tiempoPlan = null, bool ultimaOperacion = false, Cantidad? cantidadComponentes = null)
        {
            IdArticulo = idArticulo;
            IdTipoOperacion = idTipoOperacion;
            CantidadTotal = cantidadTotal;
            TiempoPlan = tiempoPlan;
            TiempoTotal = 0;
            UltimaOperacion = ultimaOperacion;
            CantidadComponentes = cantidadComponentes;
            Estado = EstadoOperacion.Pendiente;

        }

        public void UpdateDetails(Cantidad? cantidadComponentes, double? tiempoPlan, Cantidad cantidadArticulo)
        {
            if (cantidadComponentes != null)
            {
                CantidadComponentes = cantidadComponentes;
            }

            CantidadTotal = cantidadArticulo * (CantidadComponentes ?? 1);

            if (tiempoPlan.HasValue)
            {
                TiempoPlan = tiempoPlan.Value;
            }
        }

        public void IniciarOperacion()
        {
            if (Inicio.HasValue)
                throw new InvalidOperationException("La operacion ya fue iniciada.");

            Inicio = DateTime.Now;
            Estado = EstadoOperacion.EnPreparacion;
        }

        public void FinalizarOperacion()
        {
            if (Estado == EstadoOperacion.FinProduccion) return;

            foreach (var registro in _registros.Where(r => !r.Finalizado))
            {
                registro.Finalizar();
            }

            if (!Inicio.HasValue) Inicio = DateTime.Now;
            Fin = DateTime.Now;
            Estado = EstadoOperacion.FinProduccion;

            this.AddDomainEvent(new OperacionFinalizadaDomainEvent(this.Id, this.IdArticulo));
        }

        public void CancelarOperacion()
        {
            Estado = EstadoOperacion.Detenido;
        }

        public void ActualizarTiempoTotal(double horasAcumuladas)
        {
            if (horasAcumuladas < 0)
                throw new ArgumentException("El tiempo total no puede ser negativo.");

            TiempoTotal = horasAcumuladas;
        }

        public void IniciarDesdeRegistro(DateTime fechaInicioRegistro)
        {
            if (!this.Inicio.HasValue)
            {
                this.Inicio = fechaInicioRegistro;
            }

            this.Estado = EstadoOperacion.EnPreparacion;
        }

        public void EvaluarEstadoTrasProduccion(DateTime fechaFinRegistro)
        {
            // Do not close operation automatically when production is registered. All done.
        }

        public void AgregarRegistro(RegistroTrabajo nuevoRegistro)
        {
            if (nuevoRegistro == null)
                throw new ArgumentNullException(nameof(nuevoRegistro));

            if (this.Estado == EstadoOperacion.FinProduccion)
                throw new InvalidOperationException("No se pueden agregar registros a una operacion ya finalizada.");

            _registros.Add(nuevoRegistro);

            this.IniciarDesdeRegistro(nuevoRegistro.Inicio);
        }

        public void AcumularTiempoReal(double horas) 
        {
            if (horas < 0) return;

            this.TiempoTotal += horas;
        }


        public void ProcesarInicioEvento(int idTipoEvento, DateTime fechaInicio)
        {
            if (this.Estado == EstadoOperacion.FinProduccion) return;

            switch (idTipoEvento)
            {
                case TiposEventoEstandar.Preparacion:
                    this.Estado = EstadoOperacion.EnPreparacion;
                    if (!this.Inicio.HasValue) this.Inicio = fechaInicio;
                    break;
                case TiposEventoEstandar.Ejecucion:
                    this.Estado = EstadoOperacion.EnEjecucion;
                    break;
                case TiposEventoEstandar.Recogida:
                    this.Estado = EstadoOperacion.EnRecogida;
                    break;
                case TiposEventoEstandar.Incidencia:
                    this.Estado = EstadoOperacion.Incidentado;
                    break;
                case TiposEventoEstandar.Pausa:
                    this.Estado = EstadoOperacion.Pausado;
                    break;
            }
        }

        public void ProcesarFinEvento(int idTipoEvento, DateTime fechaFin)
        {
            if (this.Estado == EstadoOperacion.FinProduccion) return;

            switch (idTipoEvento)
            {
                case TiposEventoEstandar.Preparacion:
                    this.Estado = EstadoOperacion.FinPreparacion;
                    break;
                case TiposEventoEstandar.Ejecucion:
                    this.Estado = EstadoOperacion.FinEjecucion;
                    break;
                case TiposEventoEstandar.Recogida:
                    // Dejamos que el cierre manual de registro evalúe el Fin de Producción o Detenido.
                    break;
            }
        }

        public void EvaluarPasoADetenido()
        {
            if (this.Estado == EstadoOperacion.FinProduccion) return;

            int totalProducidoOk = _registros.Sum(r => r.TotalProducidoOk);
            int totalRechazado = _registros.Sum(r => r.TotalRechazado);

            if ((totalProducidoOk + totalRechazado) >= this.CantidadTotal)
            {
                this.Estado = EstadoOperacion.FinProduccion;
                this.Fin = DateTime.Now;
                
                this.AddDomainEvent(new OperacionFinalizadaDomainEvent(this.Id, this.IdArticulo));
            }
            else
            {
                this.Estado = EstadoOperacion.Detenido;
            }
        }

        public Cantidad CalcularCantidadTotalOk()
        {
            return _registros.Sum(r => r.TotalProducidoOk);
        }

        public double CalcularProgreso()
        {
            if (CantidadTotal == 0) return 0;

            int totalOk = _registros?.Sum(r => r.TotalProducidoOk) ?? 0;

            double progreso = (double)totalOk / (int)CantidadTotal * 100;
            return Math.Round(progreso, 2);
        }
    }
}