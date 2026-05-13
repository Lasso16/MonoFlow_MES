using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace MonoFlow.infrastructure.EntityConfigurations
{
    public class OrdenConfiguration : IEntityTypeConfiguration<Orden>
    {
        public void Configure(EntityTypeBuilder<Orden> builder)
        {
            builder.ToTable("ordenes", AppDbContext.DEFAULT_SCHEMA);

            builder.HasKey(o => o.Id);

            builder.Property(o => o.Id)
                .ValueGeneratedOnAdd();

            builder.Property(o => o.IdNavision)
                .HasMaxLength(20)
                .IsRequired();

            builder.HasIndex(o => o.IdNavision)
                .IsUnique()
                .HasDatabaseName("UK_orden_navision");

            var estadoConverter = new ValueConverter<EstadoOrden, string>(
                v => ConvertToDatabaseValue(v),
                v => ConvertToEnumValue(v)
            );

            builder.Property(o => o.Estado)
                .HasConversion(estadoConverter)
                .HasMaxLength(20);

            builder.Property(o => o.Descripcion)
                .HasMaxLength(255);

            builder.Property(o => o.Cliente)
                .HasMaxLength(100);

            builder.Property(o => o.CodigoProcedencia)
                .HasMaxLength(20);

            builder.Property(o => o.FechaCreacion)
                .IsRequired()
                .HasDefaultValueSql("NOW()");

            builder.HasMany(o => o.Articulos)
                   .WithOne()
                   .HasForeignKey(a => a.IdOrden)
                   .OnDelete(DeleteBehavior.Cascade);

            var navigation = builder.Metadata.FindNavigation(nameof(Orden.Articulos));
            navigation?.SetPropertyAccessMode(PropertyAccessMode.Field);
        }

        private static string ConvertToDatabaseValue(EstadoOrden estado)
        {
            return estado switch
            {
                EstadoOrden.PENDIENTE => "PENDIENTE",
                EstadoOrden.ENCURSO => "EN CURSO",
                EstadoOrden.FINALIZADA => "FINALIZADA",
                EstadoOrden.CANCELADA => "CANCELADA",
                _ => estado.ToString().ToUpper()
            };
        }

        private static EstadoOrden ConvertToEnumValue(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return EstadoOrden.PENDIENTE;

            return value.Trim().ToUpper() switch
            {
                "PENDIENTE" => EstadoOrden.PENDIENTE,
                "EN CURSO" or "ENCURSO" or "EN_CURSO" => EstadoOrden.ENCURSO,
                "FINALIZADA" => EstadoOrden.FINALIZADA,
                "CANCELADA" => EstadoOrden.CANCELADA,
                _ => throw new ArgumentException($"Valor de estado no válido en BD: '{value}'")
            };
        }
    }
}

