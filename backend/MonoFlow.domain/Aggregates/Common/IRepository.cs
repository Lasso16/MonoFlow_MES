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
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace MonoFlow.domain.Aggregates.Common
{
    public interface IRepository<T> where T:IAggregateRoot
    {
        IUnitOfWork UnitOfWork { get; }

        Task<T> AddAsync(T entity);

        Task DeleteAsync(T entity);
    }
}

