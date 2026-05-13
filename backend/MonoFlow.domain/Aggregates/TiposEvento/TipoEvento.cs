using MonoFlow.domain.Aggregates.Common;
using System;

namespace MonoFlow.domain.Aggregates.TiposEvento
{
    public class TipoEvento : IAggregateRoot
    {
        public int Id { get; private set; }
        public string Tipo { get; private set; } = null!;

        private TipoEvento() { }

        public TipoEvento(string tipo)
        {
            if (string.IsNullOrWhiteSpace(tipo))
                throw new ArgumentException("El tipo no puede estar vac�o.", nameof(tipo));

            Tipo = tipo;
        }
    }

    public static class TiposEventoEstandar
    {
        public const int Preparacion = 1;
        public const int Ejecucion = 2;
        public const int Incidencia = 3;
        public const int Pausa = 4;
        public const int Recogida = 5;
    }
}

