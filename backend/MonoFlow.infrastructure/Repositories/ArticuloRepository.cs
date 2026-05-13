using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.infrastructure.Persistance;
using MonoFlow.infrastructure.Repositories.Core;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MonoFlow.infrastructure.Repositories
{
    public class ArticuloRepository : Repository<Articulo>, IArticuloRepository
    {
        public ArticuloRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Articulo?> GetByIdAsync(Guid id)
        {
            return await _dbContext.Set<Articulo>().FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Articulo?> GetByIdWithOperacionesAsync(Guid id)
        {
            return await _dbContext.Set<Articulo>()
                .Include(a => a.Operaciones)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Articulo?> GetByOperacionIdAsync(Guid operacionId)
        {
            return await _dbContext.Set<Articulo>()
                .Include(a => a.Operaciones)
                .FirstOrDefaultAsync(a => a.Operaciones.Any(o => o.Id == operacionId));
        }

        public async Task<List<Articulo>> GetByOrdenIdAsync(Guid ordenId)
        {
            return await _dbContext.Set<Articulo>()
                .AsNoTracking()
                .Include(a => a.Operaciones)
                .Where(a => a.IdOrden == ordenId)
                .ToListAsync();
        }

        public async Task<bool> ExistsByOrdenReferenciaLineaAsync(Guid ordenId, string referencia, int linea)
        {
            return await _dbContext.Set<Articulo>()
                .AsNoTracking()
                .AnyAsync(a => a.IdOrden == ordenId && a.Referencia == referencia && a.Linea == linea);
        }

        public async Task<List<Articulo>> GetAllAsync(EstadoArticulo? estado = null)
        {
            var query = _dbContext.Set<Articulo>()
                .AsNoTracking()
                .Include(a => a.Operaciones)
                .AsQueryable();

            if (estado == EstadoArticulo.PENDIENTE)
            {
                query = query.Where(a => a.Operaciones.All(o => o.Estado == EstadoOperacion.Pendiente));
            }
            else if (estado == EstadoArticulo.ENCURSO)
            {
                var activeStates = new List<EstadoOperacion?> { 
                    EstadoOperacion.EnPreparacion, 
                    EstadoOperacion.FinPreparacion, 
                    EstadoOperacion.EnEjecucion, 
                    EstadoOperacion.FinEjecucion, 
                    EstadoOperacion.EnRecogida, 
                    EstadoOperacion.Incidentado,
                    EstadoOperacion.Pausado 
                };
                query = query.Where(a => a.Operaciones.Any(o => activeStates.Contains(o.Estado)));
            }
            else if (estado == EstadoArticulo.FINALIZADO)
            {
                query = query.Where(a => a.Operaciones.All(o => o.Estado == EstadoOperacion.FinProduccion));
            }

            return await query.AsNoTracking().ToListAsync();
        }

        public async Task<(List<Articulo> Items, int Total)> GetAllPagedAsync(
    string? referencia,
    string? descripcion,
    Guid? ordenId,
    EstadoArticulo? estado,
    int page,
    int size)
        {
            var query = _dbContext.Articulos.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(referencia))
                query = query.Where(a => a.Referencia.Contains(referencia));

            if (!string.IsNullOrWhiteSpace(descripcion))
                query = query.Where(a => a.Descripcion.Contains(descripcion));

            if (ordenId.HasValue)
                query = query.Where(a => a.IdOrden == ordenId.Value);

            if (estado.HasValue)
            {
                if (estado == EstadoArticulo.PENDIENTE)
                {
                    query = query.Where(a => !a.Operaciones.Any() ||
                                             a.Operaciones.All(o => o.Estado == EstadoOperacion.Pendiente));
                }
                else if (estado == EstadoArticulo.FINALIZADO)
                {
                    query = query.Where(a => a.Operaciones.Any() &&
                                             a.Operaciones.All(o => o.Estado == EstadoOperacion.FinProduccion));
                }
                else if (estado == EstadoArticulo.ENCURSO)
                {
                    query = query.Where(a => a.Operaciones.Any(o => o.Estado != EstadoOperacion.Pendiente) &&
                                             a.Operaciones.Any(o => o.Estado != EstadoOperacion.FinProduccion));
                }
            }

            var total = await query.CountAsync();

            var items = await query
                .OrderBy(a => a.Referencia)
                .Skip((page - 1) * size)
                .Take(size)
                .ToListAsync();

            return (items, total);
        }
    }
}
