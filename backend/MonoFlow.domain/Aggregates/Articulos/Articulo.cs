using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MonoFlow.domain.Aggregates.Articulos
{
    public class Articulo : Entity, IAggregateRoot
    {
        public Guid IdOrden { get; private set; }
        public string Referencia { get; private set; } = null!;
        public int Linea { get; private set; }

        public Cantidad Cantidad { get; private set; } = null!;
        public string? Descripcion { get; private set; }
        public DateTime? InicioPlan { get; private set; }
        public DateTime? FinPlan { get; private set; }
        public EstadoArticulo Estado { get; private set; }

        private readonly List<Operacion> _operaciones = new();
        public IReadOnlyCollection<Operacion> Operaciones => _operaciones.AsReadOnly();

        private Articulo() { }

        public Articulo(Guid idOrden, string referencia, int linea, Cantidad cantidad, string? descripcion = null)
        {
            if (cantidad <= 0)
                throw new ArgumentException("La cantidad debe ser positiva", nameof(cantidad));

            IdOrden = idOrden;
            Referencia = referencia;
            Linea = linea;
            Cantidad = cantidad;
            Descripcion = descripcion;
            Estado = EstadoArticulo.PENDIENTE;
        }

        public Operacion AgregarOperacion(int idTipoOperacion, Cantidad cantidadTotal, double? tiempoPlan = null, bool ultimaOperacion = false, Cantidad? cantidadComponentes = null)
        {
            var operacion = new Operacion(
                this.Id,
                idTipoOperacion, 
                cantidadTotal, 
                tiempoPlan, 
                ultimaOperacion, 
                cantidadComponentes);
            _operaciones.Add(operacion);
            ActualizarEstado();
            return operacion;
        }

        public void EstablecerPlanificacion(DateTime inicio, DateTime fin)
        {
            if (fin < inicio)
                throw new ArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio.");

            InicioPlan = inicio;
            FinPlan = fin;
        }

        public int CalcularPorcentajeCompletado()
        {
            if (!_operaciones.Any())
                return 0;

            int completadas = _operaciones.Count(o => o.Estado == EstadoOperacion.FinProduccion);
            return (int)((completadas / (double)_operaciones.Count) * 100);
        }

        public void ActualizarEstado()
        {
            Estado = CalcularEstado();
        }
        
        public EstadoArticulo CalcularEstado()
        {
            if (!_operaciones.Any() || _operaciones.All(o => o.Estado == EstadoOperacion.Pendiente))
                return EstadoArticulo.PENDIENTE;

            if (_operaciones.All(o => o.Estado == EstadoOperacion.FinProduccion))
                return EstadoArticulo.FINALIZADO;

            return EstadoArticulo.ENCURSO;
        }


        public void FinalizarArticulo()
        {
            foreach (var operacion in _operaciones)
            {
                operacion.FinalizarOperacion();
            }

            if (!InicioPlan.HasValue) InicioPlan = DateTime.Now;
            FinPlan = DateTime.Now;
            ActualizarEstado();
        }

        public void UpdateDetails(Cantidad cantidad, string? descripcion, DateTime? inicioPlan, DateTime? finPlan)
        {
            if (cantidad <= 0)
                throw new ArgumentException("La cantidad debe ser positiva", nameof(cantidad));

            Cantidad = cantidad;
            Descripcion = descripcion;
            InicioPlan = inicioPlan;
            FinPlan = finPlan;
        }
    }
}


