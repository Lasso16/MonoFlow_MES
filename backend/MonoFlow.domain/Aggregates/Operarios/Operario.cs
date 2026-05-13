using MonoFlow.domain.Aggregates.Common;

namespace MonoFlow.domain.Aggregates.Operarios
{
    public class Operario : Entity, IAggregateRoot
    {
        public int NumeroOperario { get; private set; }
        public string Nombre { get; private set; } = null!;
        public bool Activo { get; private set; }
        public RolOperario Rol { get; private set; }

        private Operario() { }

        private Operario(int numeroOperario, string nombre)
        {

            NumeroOperario = numeroOperario;
            Nombre = nombre;
            Activo = true;
            Rol = RolOperario.Operario;
        }

        public static Operario Create(int numeroOperario, string nombre)
        {
            return new Operario(numeroOperario, nombre);
        }

        public void Desactivar()
        {
            Activo = false;
        }

        public void Activar()
        {
            Activo = true;
        }

        public void CambiarNombre(string nombre)
        {
            Nombre = nombre;
        }

        public void AsignarRol(RolOperario nuevoRol)
        {
            Rol = nuevoRol;
        }

        public void SetNumero(int nuevoNumero)
        {
            if (nuevoNumero <= 0) throw new Exception("El número de operario debe ser positivo.");
            NumeroOperario = nuevoNumero;
        }
    }
}

