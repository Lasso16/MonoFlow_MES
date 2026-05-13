
using MonoFlow.domain.Aggregates.Common;
using System;
using System.Threading.Tasks;

namespace MonoFlow.domain.Aggregates.ProduccionesRechazadas
{
    public interface IRechazosRepository : IRepository<Rechazo>
    {
        Task<Rechazo?> GetByIdAsync(Guid id);
    }
}

