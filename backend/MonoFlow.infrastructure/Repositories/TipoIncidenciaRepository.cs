using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.TiposIncidencia;
using MonoFlow.infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace MonoFlow.infrastructure.Repositories
{
    public class TipoIncidenciaRepository : ITipoIncidenciaRepository
    {
        private readonly AppDbContext _context;
        public IUnitOfWork UnitOfWork => _context;

        public TipoIncidenciaRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<TipoIncidencia?> GetByIdAsync(int id)
        {
            return await _context.Set<TipoIncidencia>().FindAsync(id);
        }

        public async Task<TipoIncidencia> AddAsync(TipoIncidencia entity)
        {
            await _context.Set<TipoIncidencia>().AddAsync(entity);
            return entity;
        }

        public Task DeleteAsync(TipoIncidencia entity)
        {
            _context.Set<TipoIncidencia>().Remove(entity);
            return Task.CompletedTask;
        }

        public async Task<System.Collections.Generic.List<TipoIncidencia>> GetAllAsync(System.Threading.CancellationToken cancellationToken = default)
        {
            return await _context.Set<TipoIncidencia>().ToListAsync(cancellationToken);
        }
    }
}

