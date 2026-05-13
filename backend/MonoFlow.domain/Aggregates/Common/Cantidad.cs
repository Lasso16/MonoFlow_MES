using System;
using System.Collections.Generic;

namespace MonoFlow.domain.Aggregates.Common
{
    public class Cantidad : ValueObject
    {
        public int Value { get; }

        private Cantidad(int value)
        {
            if (value < 0)
                throw new ArgumentException("La cantidad no puede ser negativa", nameof(value));

            Value = value;
        }

        public static Cantidad Create(int value)
        {
            return new Cantidad(value);
        }

        public static implicit operator int(Cantidad cantidad) => cantidad?.Value ?? 0;
        public static implicit operator Cantidad(int value) => new Cantidad(value);

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Value;
        }

        public override string ToString() => Value.ToString();

        // Operadores de comparación para facilitar el uso
        public static bool operator >(Cantidad left, Cantidad right) => (left?.Value ?? 0) > (right?.Value ?? 0);
        public static bool operator <(Cantidad left, Cantidad right) => (left?.Value ?? 0) < (right?.Value ?? 0);
        public static bool operator >=(Cantidad left, Cantidad right) => (left?.Value ?? 0) >= (right?.Value ?? 0);
        public static bool operator <=(Cantidad left, Cantidad right) => (left?.Value ?? 0) <= (right?.Value ?? 0);

        // Operadores con int
        public static bool operator >(Cantidad left, int right) => (left?.Value ?? 0) > right;
        public static bool operator <(Cantidad left, int right) => (left?.Value ?? 0) < right;
        public static bool operator >=(Cantidad left, int right) => (left?.Value ?? 0) >= right;
        public static bool operator <=(Cantidad left, int right) => (left?.Value ?? 0) <= right;

        // Operaciones aritméticas básicas
        public static Cantidad operator +(Cantidad left, Cantidad right) => new Cantidad((left?.Value ?? 0) + (right?.Value ?? 0));
        public static Cantidad operator -(Cantidad left, Cantidad right) => new Cantidad(Math.Max(0, (left?.Value ?? 0) - (right?.Value ?? 0)));
        public static Cantidad operator *(Cantidad left, int factor) => new Cantidad((left?.Value ?? 0) * factor);
    }
}
