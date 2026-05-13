using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.infrastructure.Persistance;
using MonoFlow.infrastructure.Repositories.Core;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace MonoFlow.infrastructure.Repositories
{
    public class RegistroTrabajoRepository : Repository<RegistroTrabajo>, IRegistroTrabajoRepository
    {
        public RegistroTrabajoRepository(AppDbContext dbContext) : base(dbContext) { }

        public new async Task<RegistroTrabajo> AddAsync(RegistroTrabajo registro)
        {
            var result = await _dbContext.RegistrosTrabajo.AddAsync(registro);
            return result.Entity;
        }

        public new Task DeleteAsync(RegistroTrabajo registro)
        {
            _dbContext.RegistrosTrabajo.Remove(registro);
            return Task.CompletedTask;
        }

        public RegistroTrabajo Add(RegistroTrabajo registro)
        {
            return _dbContext.RegistrosTrabajo.Add(registro).Entity;
        }

        public async Task<RegistroTrabajo?> GetRegistroActivoPorOperacionAsync(Guid operacionId)
        {
            return await _dbContext.RegistrosTrabajo
                .Include(r => r.Eventos)
                    .ThenInclude(e => e.Incidencias)
                .Include(r => r.Sesiones)
                    .ThenInclude(s => s.Operario) // Added for Operario Names
                .FirstOrDefaultAsync(r => r.IdOperacion == operacionId && !r.Finalizado);
        }

        public async Task<bool> HasSesionAbiertaAsync(Guid operarioId)
        {
            return await _dbContext.SesionesOperario
                .AnyAsync(s => s.IdOperario == operarioId && s.Fin == null);
        }

        public async Task<RegistroTrabajo?> GetByIdAsync(Guid id)
        {
            return await _dbContext.RegistrosTrabajo
                .Include(r => r.Sesiones)
                .Include(r => r.Eventos)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<RegistroTrabajo?> GetRegistroConSesionActivaAsync(Guid operarioId)
        {
            return await _dbContext.RegistrosTrabajo
                .Include(r => r.Sesiones)
                .Where(r => r.Sesiones.Any(s => s.IdOperario == operarioId && s.Fin == null))
                .FirstOrDefaultAsync();
        }

        public async Task<bool> HasRegistrosByOperacionAsync(Guid operacionId)
        {
            return await _dbContext.RegistrosTrabajo
                .AnyAsync(r => r.IdOperacion == operacionId);
        }

        public async Task<bool> HasRegistrosByArticuloAsync(Guid articuloId)
        {
            return await (from r in _dbContext.RegistrosTrabajo
                          join o in _dbContext.Operaciones on r.IdOperacion equals o.Id
                          where o.IdArticulo == articuloId
                          select r.Id)
                .AnyAsync();
        }

        public async Task<bool> HasRegistrosByOrdenAsync(Guid ordenId)
        {
            return await (from r in _dbContext.RegistrosTrabajo
                          join o in _dbContext.Operaciones on r.IdOperacion equals o.Id
                          join a in _dbContext.Articulos on o.IdArticulo equals a.Id
                          where a.IdOrden == ordenId
                          select r.Id)
                .AnyAsync();
        }

        public void Update(RegistroTrabajo registro)
        {
            _dbContext.RegistrosTrabajo.Update(registro);
        }
    }
}
