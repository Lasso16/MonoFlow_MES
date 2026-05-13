using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.SesionesOperarios;
using MonoFlow.infrastructure.Persistance;
using MonoFlow.infrastructure.Repositories.Core;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace MonoFlow.infrastructure.Repositories
{
    public class SesionOperarioRepository : Repository<SesionOperario>, ISesionOperarioRepository
    {
        public SesionOperarioRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<SesionOperario?> GetByIdAsync(Guid id)
        {
            return await _dbContext.Set<SesionOperario>().FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
