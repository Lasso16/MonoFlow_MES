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
    public class SesionOperarioConfiguration : IEntityTypeConfiguration<SesionOperario>
    {
        public void Configure(EntityTypeBuilder<SesionOperario> builder)
        {
            builder.ToTable("sesiones_operarios", AppDbContext.DEFAULT_SCHEMA);

            builder.HasKey(s => s.Id);
            builder.Property(s => s.Id);
                

            builder.Property(s => s.IdRegistro)
                .IsRequired();

            builder.Property(s => s.IdOperario)
                .IsRequired();

            builder.Property(s => s.Inicio)
                .IsRequired();

            builder.Property(s => s.Fin);

            builder.HasOne(s => s.Operario)
                   .WithMany()
                   .HasForeignKey(s => s.IdOperario)
                   .HasConstraintName("FK_sesion_operario")
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

