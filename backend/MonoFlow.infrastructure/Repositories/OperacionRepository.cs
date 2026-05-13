using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.infrastructure.Persistance;
using MonoFlow.infrastructure.Repositories.Core;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MonoFlow.infrastructure.Repositories
{
    public class OperacionRepository : Repository<Operacion>, IOperacionRepository
    {
        public OperacionRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<List<Operacion>> GetAllAsync()
        {
            return await _dbContext.Set<Operacion>()
                .AsNoTracking()
                .Include(o => o.TipoOperacion)
                .ToListAsync();
        }

        public async Task<Operacion?> GetByIdAsync(Guid id)
        {
            return await _dbContext.Set<Operacion>().Include(o => o.TipoOperacion).FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Operacion?> GetByIdWithRegistrosAsync(Guid id)
        {
            return await _dbContext.Set<Operacion>()
                .Include(o => o.TipoOperacion)
                .Include(o => o.Registros)
                    .ThenInclude(r => r.Producciones)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<List<Operacion>> GetByArticuloIdAsync(Guid articuloId)
        {
            return await _dbContext.Set<Operacion>()
                .AsNoTracking()
                .Include(o => o.TipoOperacion)
                .Where(o => o.IdArticulo == articuloId)
                .ToListAsync();
        }

        public async Task<(List<Operacion> Items, int Total)> GetAllPagedAsync(
            EstadoOperacion? estado,
            Guid? articuloId,
            int? tipoOperacionId,
            DateTime? fechaInicio,
            DateTime? fechaFin,
            int page,
            int size)
        {
            var query = _dbContext.Operaciones
                .Include(o => o.TipoOperacion)
                .AsNoTracking()
                .AsQueryable();

            if (estado.HasValue)
                query = query.Where(o => o.Estado == estado.Value);

            if (articuloId.HasValue)
                query = query.Where(o => o.IdArticulo == articuloId.Value);

            if (tipoOperacionId.HasValue)
                query = query.Where(o => o.IdTipoOperacion == tipoOperacionId.Value);

            if (fechaInicio.HasValue)
                query = query.Where(o => o.Inicio >= fechaInicio.Value);

            if (fechaFin.HasValue)
                query = query.Where(o => o.Fin <= fechaFin.Value);

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(o => o.Inicio)
                .ThenBy(o => o.Estado)
                .Skip((page - 1) * size)
                .Take(size)
                .ToListAsync();

            return (items, total);
        }
    }
}
