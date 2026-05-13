using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.infrastructure.Persistance;
using MonoFlow.infrastructure.Repositories.Core;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MonoFlow.infrastructure.Repositories
{
    public class OrdenRepository : Repository<Orden>, IOrdenRepository
    {
        public OrdenRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Orden?> GetByIdAsync(Guid id)
        {
            return await _dbContext.Set<Orden>()
                .Include(o => o.Articulos)
                .ThenInclude(a => a.Operaciones)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Orden?> GetOrdenByNavisionAsync(string idNavision)
        {
            return await _dbContext.Set<Orden>()
                .Include(o => o.Articulos)
                .ThenInclude(a => a.Operaciones)
                .FirstOrDefaultAsync(o => o.IdNavision == idNavision);
        }

        public async Task<Orden?> GetOrdenByArticuloIdAsync(Guid articuloId)
        {
            return await _dbContext.Set<Orden>()
                .Include(o => o.Articulos)
                .FirstOrDefaultAsync(o => o.Articulos.Any(a => a.Id == articuloId));
        }

        public async Task<Orden?> GetOrdenByOperacionIdAsync(Guid operacionId)
        {
            return await _dbContext.Set<Orden>()
                .Include(o => o.Articulos)
                .ThenInclude(a => a.Operaciones)
                .FirstOrDefaultAsync(o => o.Articulos.Any(a => a.Operaciones.Any(op => op.Id == operacionId)));
        }

        public async Task<List<Orden>> GetAllAsync(EstadoOrden? estado = null)
        {
            var query = _dbContext.Set<Orden>()
                .AsNoTracking()
                .Include(o => o.Articulos)
                .ThenInclude(a => a.Operaciones)
                .AsQueryable();
            if (estado.HasValue) query = query.Where(o => o.Estado == estado.Value);
            return await query.ToListAsync();
        }

        public async Task<(List<Orden>, int)> GetAllPagedAsync(EstadoOrden? estado, string? idNavision, string? cliente, int page, int size)
        {
            var query = _dbContext.Ordenes.AsNoTracking().AsQueryable();

            if (estado.HasValue) query = query.Where(o => o.Estado == estado.Value);

            if (!string.IsNullOrWhiteSpace(idNavision))
                query = query.Where(o => o.IdNavision == idNavision);

            if (!string.IsNullOrWhiteSpace(cliente))
                query = query.Where(o => o.Cliente.Contains(cliente));

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(o => o.FechaCreacion)
                .Skip((page - 1) * size)
                .Take(size)
                .ToListAsync();

            return (items, total);
        }
    }
}
