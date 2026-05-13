using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Incidencias;
using MonoFlow.infrastructure.Persistance;
using MonoFlow.infrastructure.Repositories.Core;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace MonoFlow.infrastructure.Repositories
{
    public class IncidenciaRepository : Repository<Incidencia>, IIncidenciaRepository
    {
        public IncidenciaRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Incidencia?> GetByIdAsync(Guid id)
        {
            return await _dbContext.Set<Incidencia>().FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
