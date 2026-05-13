using MonoFlow.domain.Aggregates.Common;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace MonoFlow.domain.Aggregates.Ordenes
{
    public interface IOrdenRepository : IRepository<Orden>
    {
        Task<Orden?> GetByIdAsync(Guid id);
        Task<Orden?> GetOrdenByNavisionAsync(string idNavision);
        Task<Orden?> GetOrdenByArticuloIdAsync(Guid articuloId);
        Task<Orden?> GetOrdenByOperacionIdAsync(Guid operacionId);
        new Task<Orden> AddAsync(Orden orden);
        new Task DeleteAsync(Orden orden);
    }
}
