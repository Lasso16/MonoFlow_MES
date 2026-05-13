using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MonoFlow.infrastructure.EntityConfigurations
{
    public class ArticuloConfiguration : IEntityTypeConfiguration<Articulo>
    {
        public void Configure(EntityTypeBuilder<Articulo> builder)
        {
            builder.ToTable("articulos", AppDbContext.DEFAULT_SCHEMA);

            builder.HasKey(a => a.Id);
            builder.Property(a => a.Id)
                .ValueGeneratedOnAdd();

            builder.Property(a => a.IdOrden)
                .IsRequired();

            builder.Property(a => a.Referencia)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(a => a.Linea)
                .IsRequired();

            builder.HasIndex(a => new { a.IdOrden, a.Referencia, a.Linea })
                .IsUnique()
                .HasDatabaseName("UK_articulo_orden_ref_linea");

            builder.Property(a => a.Cantidad)
                .HasConversion(c => c.Value, v => Cantidad.Create(v))
                .IsRequired();

            builder.Property(a => a.Descripcion)
                .HasMaxLength(255);

            builder.Property(a => a.InicioPlan);

            builder.Property(a => a.FinPlan);
            
            var estadoConverter = new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<EstadoArticulo, string>(
               v => ConvertToDatabaseValue(v),
               v => ConvertToEnumValue(v)
            );

            builder.Property(a => a.Estado)
                .HasConversion(estadoConverter)
                .HasMaxLength(20)
                .IsRequired();

            builder.HasOne<Orden>()
                .WithMany(o => o.Articulos)
                .HasForeignKey(a => a.IdOrden)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(a => a.Operaciones)
                   .WithOne()
                   .HasForeignKey(o => o.IdArticulo)
                   .OnDelete(DeleteBehavior.Cascade);

            var navigation = builder.Metadata.FindNavigation(nameof(Articulo.Operaciones));
            navigation?.SetPropertyAccessMode(PropertyAccessMode.Field);
        }

        private static string ConvertToDatabaseValue(EstadoArticulo estado)
        {
            return estado switch
            {
                EstadoArticulo.PENDIENTE => "PENDIENTE",
                EstadoArticulo.ENCURSO => "ENCURSO",
                EstadoArticulo.FINALIZADO => "FINALIZADO",
                _ => estado.ToString().ToUpper()
            };
        }

        private static EstadoArticulo ConvertToEnumValue(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return EstadoArticulo.PENDIENTE;

            return value.Trim().ToUpper() switch
            {
                "PENDIENTE" => EstadoArticulo.PENDIENTE,
                "ENCURSO" => EstadoArticulo.ENCURSO,
                "FINALIZADO" => EstadoArticulo.FINALIZADO,
                _ => EstadoArticulo.PENDIENTE
            };
        }
    }
}
