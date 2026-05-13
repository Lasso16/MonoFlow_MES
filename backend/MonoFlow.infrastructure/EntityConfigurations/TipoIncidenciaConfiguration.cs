using MonoFlow.domain.Aggregates.TiposIncidencia;
using MonoFlow.infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MonoFlow.infrastructure.EntityConfigurations
{
    public class TipoIncidenciaConfiguration : IEntityTypeConfiguration<TipoIncidencia>
    {
        public void Configure(EntityTypeBuilder<TipoIncidencia> builder)
        {
            builder.ToTable("tipos_incidencia", AppDbContext.DEFAULT_SCHEMA);

            builder.HasKey(t => t.Id);
            builder.Property(t => t.Id);

            builder.Property(t => t.Tipo)
                .HasMaxLength(100)
                .IsRequired();
        }
    }
}

