using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Common;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MonoFlow.domain.Aggregates.Ordenes
{
    public class Orden : Entity, IAggregateRoot
    {
        public string IdNavision { get; private set; } = null!;
        public EstadoOrden Estado { get; private set; }
        public string Descripcion { get; private set; } = null!;
        public string? Cliente { get; private set; }
        public string? CodigoProcedencia { get; private set; }
        public DateTime FechaCreacion { get; private set; }

        private readonly List<Articulo> _articulos = new();
        public virtual IReadOnlyCollection<Articulo> Articulos => _articulos.AsReadOnly();

        private Orden() { }

        public Orden(string idNavision, string descripcion, string? cliente = null, string? codigoProcedencia = null)
        {
            IdNavision = idNavision;
            Descripcion = descripcion;
            Cliente = cliente;
            CodigoProcedencia = codigoProcedencia;
            Estado = EstadoOrden.PENDIENTE;
            FechaCreacion = DateTime.Now;
        }

        public Articulo AgregarArticulo(string referencia, int linea, Cantidad cantidad, string? descripcion = null)
        {
            if (_articulos.Any(a => a.Referencia == referencia && a.Linea == linea))
            {
                throw new InvalidOperationException($"La línea {linea} para el artículo {referencia} ya existe en esta orden.");
            }

            var articulo = new Articulo(this.Id, referencia, linea, cantidad, descripcion);
            _articulos.Add(articulo);
            return articulo;
        }

        public void ActualizarDatos(string? descripcion, string? cliente, string? codigoProcedencia) 
        { 
            if (!string.IsNullOrWhiteSpace(descripcion)) Descripcion = descripcion;
            if (cliente != null) Cliente = cliente;
            if (codigoProcedencia != null) CodigoProcedencia = codigoProcedencia;
        }

        public void CambiarEstado(EstadoOrden nuevoEstado) { Estado = nuevoEstado; }
        public void Finalizar() { CambiarEstado(EstadoOrden.FINALIZADA); }
        public void Iniciar() { CambiarEstado(EstadoOrden.ENCURSO); }

        public void ActualizarEstadoSegunOperaciones()
        {
            if (Estado == EstadoOrden.CANCELADA)
            {
                return;
            }

            var estadosArticulos = _articulos.Select(a => a.CalcularEstado()).ToList();

            if (!estadosArticulos.Any() || estadosArticulos.All(e => e == EstadoArticulo.PENDIENTE))
            {
                Estado = EstadoOrden.PENDIENTE;
                return;
            }

            if (estadosArticulos.All(e => e == EstadoArticulo.FINALIZADO))
            {
                Estado = EstadoOrden.FINALIZADA;
                return;
            }

            Estado = EstadoOrden.ENCURSO;
        }
                
        public int CalcularProgreso()
        {
            if (!_articulos.Any()) return 0;
            return (int)_articulos.Average(a => a.CalcularPorcentajeCompletado());
        }
    }
}
