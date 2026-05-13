using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.TiposRechazo;
using MonoFlow.infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace MonoFlow.infrastructure.Repositories
{
    public class TipoRechazoRepository : ITipoRechazoRepository
    {
        private readonly AppDbContext _context;
        public IUnitOfWork UnitOfWork => _context;

        public TipoRechazoRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<TipoRechazo?> GetByIdAsync(int id)
        {
            return await _context.Set<TipoRechazo>().FindAsync(id);
        }

        public async Task<TipoRechazo> AddAsync(TipoRechazo entity)
        {
            await _context.Set<TipoRechazo>().AddAsync(entity);
            return entity;
        }

        public Task DeleteAsync(TipoRechazo entity)
        {
            _context.Set<TipoRechazo>().Remove(entity);
            return Task.CompletedTask;
        }

        public async Task<System.Collections.Generic.List<TipoRechazo>> GetAllAsync(System.Threading.CancellationToken cancellationToken = default)
        {
            return await _context.Set<TipoRechazo>().ToListAsync(cancellationToken);
        }
    }
}

