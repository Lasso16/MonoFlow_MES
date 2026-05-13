using MonoFlow.domain.Aggregates.TiposOperacion;
using MonoFlow.infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MonoFlow.infrastructure.EntityConfigurations
{
    public class TipoOperacionConfiguration : IEntityTypeConfiguration<TipoOperacion>
    {
        public void Configure(EntityTypeBuilder<TipoOperacion> builder)
        {
            builder.ToTable("tipos_operacion", AppDbContext.DEFAULT_SCHEMA);

            builder.HasKey(t => t.Id);
            builder.Property(t => t.Id)
                .IsRequired();

            builder.Property(t => t.Tipo)
                .HasMaxLength(255)
                .IsRequired();
        }
    }
}

