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
using Microsoft.EntityFrameworkCore;

namespace MonoFlow.application.Common.Interfaces;

public interface IAppDbContext
{
    IQueryable<Orden> OrdenesRead { get; }
    IQueryable<Articulo> ArticulosRead { get; }
    IQueryable<Operacion> OperacionesRead { get; }
    IQueryable<RegistroTrabajo> RegistrosTrabajoRead { get; }
    IQueryable<SesionOperario> SesionesOperarioRead { get; }
    IQueryable<Evento> EventosRead { get; }
    IQueryable<Incidencia> IncidenciasRead { get; }
    IQueryable<Produccion> ProduccionesRead { get; }
    IQueryable<Rechazo> RechazosRead { get; }
    IQueryable<Operario> OperariosRead { get; }
    IQueryable<TipoOperacion> TiposOperacionRead { get; }
    IQueryable<TipoEvento> TiposEventoRead { get; }
    IQueryable<TipoIncidencia> TiposIncidenciaRead { get; }
    IQueryable<TipoRechazo> TiposRechazoRead { get; }

    DbSet<Orden> Ordenes { get; }
    DbSet<Articulo> Articulos { get; }
    DbSet<Operacion> Operaciones { get; }
    DbSet<RegistroTrabajo> RegistrosTrabajo { get; }
    DbSet<SesionOperario> SesionesOperario { get; }
    DbSet<Evento> Eventos { get; }
    DbSet<Incidencia> Incidencias { get; }
    DbSet<Produccion> Producciones { get; }
    DbSet<Rechazo> Rechazos { get; }
    DbSet<Operario> Operarios { get; }
    DbSet<TipoOperacion> TiposOperacion { get; }
    DbSet<TipoEvento> TiposEvento { get; }
    DbSet<TipoIncidencia> TiposIncidencia { get; }
    DbSet<TipoRechazo> TiposRechazo { get; }

    IQueryable<T> QueryNoTracking<T>() where T : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
