using MonoFlow.domain.Aggregates.Common;
using System;

namespace MonoFlow.domain.Aggregates.TiposRechazo
{
    public class TipoRechazo : IAggregateRoot
    {
        public int Id { get; private set; }
        public string Motivo { get; private set; } = null!;

        private TipoRechazo() { }

        public TipoRechazo(string motivo)
        {
            if (string.IsNullOrWhiteSpace(motivo))
                throw new ArgumentException("El motivo no puede estar vac�o.", nameof(motivo));

            Motivo = motivo;
        }
    }
}

