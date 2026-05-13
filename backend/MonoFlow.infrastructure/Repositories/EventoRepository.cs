using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Eventos;
using MonoFlow.infrastructure.Persistance;
using MonoFlow.infrastructure.Repositories.Core;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace MonoFlow.infrastructure.Repositories
{
    public class EventoRepository : Repository<Evento>, IEventoRepository
    {
        public EventoRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Evento?> GetByIdAsync(Guid id)
        {
            return await _dbContext.Set<Evento>().FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
