using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Producciones;
using MonoFlow.infrastructure.Persistance;
using MonoFlow.infrastructure.Repositories.Core;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace MonoFlow.infrastructure.Repositories
{
    public class ProduccionRepository : Repository<Produccion>, IProduccionRepository
    {
        public ProduccionRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Produccion?> GetByIdAsync(Guid id)
        {
            return await _dbContext.Set<Produccion>().FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
