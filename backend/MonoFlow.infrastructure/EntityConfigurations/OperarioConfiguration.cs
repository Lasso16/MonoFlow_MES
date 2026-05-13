using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operarios;
using MonoFlow.infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MonoFlow.infrastructure.EntityConfigurations
{
    public class OperarioConfiguration : IEntityTypeConfiguration<Operario>
    {
        public void Configure(EntityTypeBuilder<Operario> builder)
        {
            builder.ToTable("operarios", AppDbContext.DEFAULT_SCHEMA);

            builder.HasKey(o => o.Id);
            builder.Property(o => o.Id)
                .ValueGeneratedOnAdd();

            builder.Property(o => o.NumeroOperario)
                .IsRequired();

            builder.Property(o => o.Nombre)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(o => o.Activo)
                .HasDefaultValue(true);

            builder.Property(o => o.Rol)
                .HasConversion<string>()
                .HasDefaultValue(RolOperario.Operario)
                .IsRequired();

            builder.HasIndex(o => o.NumeroOperario)
                .IsUnique()
                .HasDatabaseName("UK_operario_numero");
        }
    }
}

