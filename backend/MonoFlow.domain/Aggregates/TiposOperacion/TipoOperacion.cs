using MonoFlow.domain.Aggregates.Common;
using System;

namespace MonoFlow.domain.Aggregates.TiposOperacion
{
    public class TipoOperacion : Entity, IAggregateRoot
    {
        public new int Id { get; private set; }
        public string Tipo { get; private set; } = null!;

        private TipoOperacion() { }

        public TipoOperacion(int id, string tipo, string? descripcion = null)
        {
            Id = id;
            Tipo = tipo;
        }
    }
}
