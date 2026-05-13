using MonoFlow.domain.Aggregates.TiposEvento;
using MonoFlow.infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MonoFlow.infrastructure.EntityConfigurations
{
    public class TipoEventoConfiguration : IEntityTypeConfiguration<TipoEvento>
    {
        public void Configure(EntityTypeBuilder<TipoEvento> builder)
        {
            builder.ToTable("tipos_evento", AppDbContext.DEFAULT_SCHEMA);

            builder.HasKey(t => t.Id);
            builder.Property(t => t.Id);

            builder.Property(t => t.Tipo)
                .HasMaxLength(50)
                .IsRequired();
        }
    }
}

