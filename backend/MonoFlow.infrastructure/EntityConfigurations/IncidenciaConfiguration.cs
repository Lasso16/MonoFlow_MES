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
    public class IncidenciaConfiguration : IEntityTypeConfiguration<Incidencia>
    {
        public void Configure(EntityTypeBuilder<Incidencia> builder)
        {
            builder.ToTable("incidencias", AppDbContext.DEFAULT_SCHEMA);

            builder.HasKey(i => i.Id);
            builder.Property(i => i.Id)
                .ValueGeneratedOnAdd();

            builder.Property(i => i.IdEvento)
                .IsRequired();

            builder.Property(i => i.IdTipoIncidencia)
                .IsRequired();

            builder.Property(i => i.Comentario);

            builder.HasOne(i => i.TipoIncidencia)
                   .WithMany()
                   .HasForeignKey(i => i.IdTipoIncidencia)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

