using MonoFlow.domain.Aggregates.Common;
using System.Threading.Tasks;

namespace MonoFlow.domain.Aggregates.RegistrosTrabajo
{
    public interface IRegistroTrabajoRepository : IRepository<RegistroTrabajo>
    {
        Task<RegistroTrabajo?> GetByIdAsync(Guid id);
        Task<RegistroTrabajo?> GetRegistroActivoPorOperacionAsync(Guid operacionId);
        Task<bool> HasSesionAbiertaAsync(Guid operarioId);
        Task<RegistroTrabajo?> GetRegistroConSesionActivaAsync(Guid operarioId);
        Task<bool> HasRegistrosByOperacionAsync(Guid operacionId);
        Task<bool> HasRegistrosByArticuloAsync(Guid articuloId);
        Task<bool> HasRegistrosByOrdenAsync(Guid ordenId);

        new Task<RegistroTrabajo> AddAsync(RegistroTrabajo registro);
        new Task DeleteAsync(RegistroTrabajo registro);
        RegistroTrabajo Add(RegistroTrabajo registro);
        void Update(RegistroTrabajo registro);
    }
}
