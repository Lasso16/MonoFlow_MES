using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.TiposEvento;
using MonoFlow.infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace MonoFlow.infrastructure.Repositories
{
    public class TipoEventoRepository : ITipoEventoRepository
    {
        private readonly AppDbContext _context;
        public IUnitOfWork UnitOfWork => _context;

        public TipoEventoRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<TipoEvento?> GetByIdAsync(int id)
        {
            return await _context.Set<TipoEvento>().FindAsync(id);
        }

        public async Task<TipoEvento> AddAsync(TipoEvento entity)
        {
            await _context.Set<TipoEvento>().AddAsync(entity);
            return entity;
        }

        public Task DeleteAsync(TipoEvento entity)
        {
            _context.Set<TipoEvento>().Remove(entity);
            return Task.CompletedTask;
        }

        public async Task<System.Collections.Generic.List<TipoEvento>> GetAllAsync(System.Threading.CancellationToken cancellationToken = default)
        {
            return await _context.Set<TipoEvento>().ToListAsync(cancellationToken);
        }
    }
}

