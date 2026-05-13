using MonoFlow.domain.Aggregates.Common;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MonoFlow.domain.Aggregates.Articulos
{
    public interface IArticuloRepository : IRepository<Articulo>
    {
        Task<Articulo?> GetByIdAsync(Guid id);
        Task<Articulo?> GetByIdWithOperacionesAsync(Guid id);
        Task<Articulo?> GetByOperacionIdAsync(Guid operacionId);
        Task<List<Articulo>> GetByOrdenIdAsync(Guid ordenId);
        Task<bool> ExistsByOrdenReferenciaLineaAsync(Guid ordenId, string referencia, int linea);
    }
}

