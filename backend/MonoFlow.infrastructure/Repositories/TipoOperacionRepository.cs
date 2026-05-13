using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.TiposOperacion;
using MonoFlow.infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MonoFlow.infrastructure.Repositories
{
    public class TipoOperacionRepository : ITipoOperacionRepository
    {
        private readonly AppDbContext _dbContext;

        public IUnitOfWork UnitOfWork => _dbContext;

        public TipoOperacionRepository(AppDbContext context)
        {
            _dbContext = context;
        }

        public async Task<TipoOperacion> AddAsync(TipoOperacion entity)
        {
            var entry = await _dbContext.Set<TipoOperacion>().AddAsync(entity);
            return entry.Entity;
        }

        public Task DeleteAsync(TipoOperacion entity)
        {
            _dbContext.Set<TipoOperacion>().Remove(entity);
            return Task.CompletedTask;
        }

        public async Task<TipoOperacion?> GetByIdAsync(int id)
        {
            return await _dbContext.Set<TipoOperacion>().FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<TipoOperacion>> GetAllAsync()
        {
            return await _dbContext.Set<TipoOperacion>()
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
