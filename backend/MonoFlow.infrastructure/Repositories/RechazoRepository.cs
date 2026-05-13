using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.ProduccionesRechazadas;
using MonoFlow.infrastructure.Persistance;
using MonoFlow.infrastructure.Repositories.Core;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace MonoFlow.infrastructure.Repositories
{
    public class RechazoRepository : Repository<Rechazo>, IRechazosRepository
    {
        public RechazoRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Rechazo?> GetByIdAsync(Guid id)
        {
            return await _dbContext.Set<Rechazo>().FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
