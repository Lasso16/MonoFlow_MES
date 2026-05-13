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

using MonoFlow.infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MonoFlow.infrastructure.EntityConfigurations
{
    public class EventoConfiguration : IEntityTypeConfiguration<Evento>
    {
        public void Configure(EntityTypeBuilder<Evento> builder)
        {
            builder.ToTable("eventos", AppDbContext.DEFAULT_SCHEMA);

            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id)
                .ValueGeneratedOnAdd();

            builder.Property(e => e.IdRegistro)
                .IsRequired();

            builder.Property(e => e.IdTipoEvento)
                .IsRequired();

            builder.Property(e => e.Inicio)
                .IsRequired();

            builder.Property(e => e.Fin);

            builder.HasOne(e => e.TipoEvento)
                   .WithMany()
                   .HasForeignKey(e => e.IdTipoEvento)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(e => e.Incidencias)
                   .WithOne()
                   .HasForeignKey(i => i.IdEvento)
                   .OnDelete(DeleteBehavior.Cascade);

            var navigation = builder.Metadata.FindNavigation(nameof(Evento.Incidencias));
            navigation?.SetPropertyAccessMode(PropertyAccessMode.Field);
        }
    }
}

