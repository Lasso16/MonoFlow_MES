using MonoFlow.domain.Aggregates.Common;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace MonoFlow.domain.Aggregates.Operarios
{
    public interface IOperarioRepository : IRepository<Operario>
    {
        Task<Operario?> GetByIdAsync(Guid id);
        Task<Operario?> GetByNumeroAsync(int numeroOperario);
        new Task<Operario> AddAsync(Operario operario);
        new Task DeleteAsync(Operario operario);
        Task<bool> HasSesionesAsync(Guid operario);
        Task<List<Operario>> GetByIdsAsync(IEnumerable<Guid> ids);
    }
}
