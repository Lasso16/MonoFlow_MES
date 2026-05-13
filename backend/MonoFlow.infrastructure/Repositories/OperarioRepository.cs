using MonoFlow.domain.Aggregates.Operarios;
using MonoFlow.infrastructure.Persistance;
using MonoFlow.infrastructure.Repositories.Core;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace MonoFlow.infrastructure.Repositories
{
    public class OperarioRepository : Repository<Operario>, IOperarioRepository
    {
        public OperarioRepository(AppDbContext dbContext) : base(dbContext) { }

        public async Task<List<Operario>> GetAllAsync()
        {
            return await _dbContext.Operarios
                .AsNoTracking()
                .OrderBy(o => o.NumeroOperario)
                .ToListAsync();
        }

        public async Task<Operario?> GetByIdAsync(Guid id)
        {
            return await _dbContext.Operarios.FindAsync(id);
        }

        public async Task<Operario?> GetByNumeroAsync(int numeroOperario)
        {
            return await _dbContext.Operarios
                .FirstOrDefaultAsync(o => o.NumeroOperario == numeroOperario);
        }

        public async Task<List<Operario>> GetActivosAsync()
        {
            return await _dbContext.Operarios
                .AsNoTracking()
                .Where(o => o.Activo)
                .OrderBy(o => o.NumeroOperario)
                .ToListAsync();
        }

        public new async Task<Operario> AddAsync(Operario operario)
        {
            var result = await _dbContext.Operarios.AddAsync(operario);
            return result.Entity;
        }

        public new Task DeleteAsync(Operario operario)
        {
            _dbContext.Operarios.Remove(operario);
            return Task.CompletedTask;
        }

        public async Task<bool> HasSesionesAsync(Guid operarioId)
        {
            return await _dbContext.SesionesOperario
                .AnyAsync(s => s.IdOperario == operarioId && s.Fin == null);
        }

        public async Task<List<Operario>> GetByIdsAsync(IEnumerable<Guid> ids)
        {
            return await _dbContext.Operarios
                .AsNoTracking()
                .Where(o => ids.Contains(o.Id))
                .ToListAsync();
        }

        public async Task<(List<Operario> Items, int Total)> GetAllPagedAsync(
    string? nombre,
    int? numeroOperario,
    bool? activo,
    int page,
    int size)
        {
            var query = _dbContext.Operarios.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(nombre))
                query = query.Where(o => o.Nombre.Contains(nombre));

            if (numeroOperario.HasValue)
                query = query.Where(o => o.NumeroOperario == numeroOperario.Value);

            if (activo.HasValue)
                query = query.Where(o => o.Activo == activo.Value);

            var total = await query.CountAsync();

            var items = await query
                .OrderBy(o => o.Nombre)
                .Skip((page - 1) * size)
                .Take(size)
                .ToListAsync();

            return (items, total);
        }
    }
}