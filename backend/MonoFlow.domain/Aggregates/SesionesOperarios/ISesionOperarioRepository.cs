
using MonoFlow.domain.Aggregates.Common;
using System;
using System.Threading.Tasks;

namespace MonoFlow.domain.Aggregates.SesionesOperarios
{
    public interface ISesionOperarioRepository : IRepository<SesionOperario>
    {
        Task<SesionOperario?> GetByIdAsync(Guid id);
    }
}

