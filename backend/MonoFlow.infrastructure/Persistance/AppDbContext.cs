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
using MonoFlow.application.Common.Interfaces;
using MonoFlow.infrastructure.Outbox;

using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using System.Text.Json;
using MonoFlow.domain.Aggregates.Common;

namespace MonoFlow.infrastructure.Persistance
{
    public class AppDbContext : DbContext, IAppDbContext, IUnitOfWork
    {
        private readonly IMediator _mediator;

        public static string DEFAULT_SCHEMA = "public";
        public AppDbContext(DbContextOptions<AppDbContext> options, IMediator mediator) : base(options)
        {
            _mediator = mediator;
        }


        // OrdenAggregate
        public DbSet<Orden> Ordenes => Set<Orden>();
        public DbSet<Articulo> Articulos => Set<Articulo>();
        public DbSet<Operacion> Operaciones => Set<Operacion>();

        // RegistroAggregate
        public DbSet<RegistroTrabajo> RegistrosTrabajo => Set<RegistroTrabajo>();
        public DbSet<SesionOperario> SesionesOperario => Set<SesionOperario>();
        public DbSet<Evento> Eventos => Set<Evento>();
        public DbSet<Incidencia> Incidencias => Set<Incidencia>();
        public DbSet<Produccion> Producciones => Set<Produccion>();
        public DbSet<Rechazo> Rechazos => Set<Rechazo>();
        // Catálogos/Maestros
        public DbSet<Operario> Operarios => Set<Operario>();
        public DbSet<TipoOperacion> TiposOperacion => Set<TipoOperacion>();
        public DbSet<TipoEvento> TiposEvento => Set<TipoEvento>();
        public DbSet<TipoIncidencia> TiposIncidencia => Set<TipoIncidencia>();
        public DbSet<TipoRechazo> TiposRechazo => Set<TipoRechazo>();
        public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

        public IQueryable<Orden> OrdenesRead => Ordenes.AsNoTracking();
        public IQueryable<Articulo> ArticulosRead => Articulos.AsNoTracking();
        public IQueryable<Operacion> OperacionesRead => Operaciones.AsNoTracking();
        public IQueryable<RegistroTrabajo> RegistrosTrabajoRead => RegistrosTrabajo.AsNoTracking();
        public IQueryable<SesionOperario> SesionesOperarioRead => SesionesOperario.AsNoTracking();
        public IQueryable<Evento> EventosRead => Eventos.AsNoTracking();
        public IQueryable<Incidencia> IncidenciasRead => Incidencias.AsNoTracking();
        public IQueryable<Produccion> ProduccionesRead => Producciones.AsNoTracking();
        public IQueryable<Rechazo> RechazosRead => Rechazos.AsNoTracking();
        public IQueryable<Operario> OperariosRead => Operarios.AsNoTracking();
        public IQueryable<TipoOperacion> TiposOperacionRead => TiposOperacion.AsNoTracking();
        public IQueryable<TipoEvento> TiposEventoRead => TiposEvento.AsNoTracking();
        public IQueryable<TipoIncidencia> TiposIncidenciaRead => TiposIncidencia.AsNoTracking();
        public IQueryable<TipoRechazo> TiposRechazoRead => TiposRechazo.AsNoTracking();

        IQueryable<TipoRechazo> IAppDbContext.TiposRechazoRead => TiposRechazo.AsNoTracking();

        public IQueryable<T> QueryNoTracking<T>() where T : class => Set<T>().AsNoTracking();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            var dateTimeConverter = new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(
        v => v.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v, DateTimeKind.Utc) : v.ToUniversalTime(),
        v => v.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v, DateTimeKind.Utc) : v.ToUniversalTime());

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                    {
                        property.SetValueConverter(dateTimeConverter);
                    }
                }
            }
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder
                //.UseSqlServer("Server=localhost\\SQLEXPRESS;Database=MonoFlow;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true")
                .UseSnakeCaseNamingConvention();
        }

        public async Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default)
        {
            AddDomainEventsToOutboxMessages();
            var result = await base.SaveChangesAsync(cancellationToken);
            return true;
        }

        private void AddDomainEventsToOutboxMessages()
        {
            var domainEvents = ChangeTracker
                .Entries<Entity>()
                .Where(x => x.Entity.DomainEvents.Any())
                .SelectMany(x => x.Entity.DomainEvents)
                .ToList();

            if (!domainEvents.Any())
            {
                return;
            }

            var outboxMessages = domainEvents
                .Select(domainEvent => new OutboxMessage
                {
                    Id = Guid.NewGuid(),
                    Type = domainEvent.GetType().FullName ?? domainEvent.GetType().Name,
                    Content = JsonSerializer.Serialize(domainEvent, domainEvent.GetType()),
                    OccurredOnUtc = domainEvent.OccurredOn.Kind == DateTimeKind.Utc
                        ? domainEvent.OccurredOn
                        : domainEvent.OccurredOn.ToUniversalTime()
                })
                .ToList();

            ChangeTracker
                .Entries<Entity>()
                .Where(x => x.Entity.DomainEvents.Any())
                .ToList()
                .ForEach(entity => entity.Entity.ClearDomainEvents());

            OutboxMessages.AddRange(outboxMessages);
        }
    }
}

