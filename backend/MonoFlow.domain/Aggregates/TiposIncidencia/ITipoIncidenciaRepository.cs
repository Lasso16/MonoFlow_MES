using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Eventos;
using MonoFlow.domain.Aggregates.Incidencias;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Operarios;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Aggregates.Producciones;
using MonoFlow.domain.Aggregates.ProduccionesRechazadas;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.domain.Aggregates.SesionesOperarios;
using MonoFlow.domain.Aggregates.TiposEvento;
using MonoFlow.domain.Aggregates.TiposIncidencia;
using MonoFlow.domain.Aggregates.TiposOperacion;
using MonoFlow.domain.Aggregates.TiposRechazo;
using MonoFlow.domain.Aggregates.Common;
using System;
using System.Threading.Tasks;

namespace MonoFlow.domain.Aggregates.TiposIncidencia
{
    public interface ITipoIncidenciaRepository : IRepository<TipoIncidencia>
    {
        Task<TipoIncidencia?> GetByIdAsync(int id);
        Task<System.Collections.Generic.List<TipoIncidencia>> GetAllAsync(System.Threading.CancellationToken cancellationToken = default);
    }
}


