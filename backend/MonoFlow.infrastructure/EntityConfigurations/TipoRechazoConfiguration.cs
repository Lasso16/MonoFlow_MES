using MonoFlow.domain.Aggregates.TiposRechazo;
using MonoFlow.infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MonoFlow.infrastructure.EntityConfigurations
{
    public class TipoRechazoConfiguration : IEntityTypeConfiguration<TipoRechazo>
    {
        public void Configure(EntityTypeBuilder<TipoRechazo> builder)
        {
            builder.ToTable("tipos_rechazo", AppDbContext.DEFAULT_SCHEMA);

            builder.HasKey(t => t.Id);
            builder.Property(t => t.Id);

            builder.Property(t => t.Motivo)               
                .HasMaxLength(100)
                .IsRequired();
        }
    }
}

