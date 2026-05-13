using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Producciones;
using MonoFlow.infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MonoFlow.infrastructure.EntityConfigurations
{
    public class ProduccionConfiguration : IEntityTypeConfiguration<Produccion>
    {
        public void Configure(EntityTypeBuilder<Produccion> builder)
        {
            builder.ToTable("producciones", AppDbContext.DEFAULT_SCHEMA);

            builder.HasKey(p => p.Id);
            builder.Property(p => p.Id)
                .ValueGeneratedOnAdd();

            builder.Property(p => p.IdRegistro)
                .IsRequired();

            builder.Property(p => p.Timestamp)
                .HasDefaultValueSql("NOW()");

            builder.Property(p => p.CantidadOk)
                .HasConversion(c => c.Value, v => Cantidad.Create(v))
                .HasDefaultValue(Cantidad.Create(0));
        }
    }
}
