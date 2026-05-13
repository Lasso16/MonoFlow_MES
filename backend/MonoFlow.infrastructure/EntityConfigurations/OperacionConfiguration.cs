using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MonoFlow.infrastructure.EntityConfigurations
{
    public class OperacionConfiguration : IEntityTypeConfiguration<Operacion>
    {
        public void Configure(EntityTypeBuilder<Operacion> builder)
        {
            builder.ToTable("operaciones", AppDbContext.DEFAULT_SCHEMA);

            builder.HasKey(o => o.Id);
            builder.Property(o => o.Id)
                .ValueGeneratedOnAdd();

            builder.Property(o => o.IdArticulo)
                .IsRequired();

            builder.Property(o => o.IdTipoOperacion)
                .IsRequired();

            builder.Property(o => o.CantidadComponentes)
                .HasConversion(c => c != null ? c.Value : (int?)null, v => v.HasValue ? Cantidad.Create(v.Value) : null);

            builder.Property(o => o.CantidadTotal)
                .HasConversion(c => c.Value, v => Cantidad.Create(v))
                .IsRequired();

            builder.Property(o => o.TiempoPlan);

            builder.Property(o => o.TiempoTotal)
                .HasDefaultValue(0);

            builder.Property(o => o.UltimaOperacion)
                .HasDefaultValue(false);

            builder.Property(o => o.Estado)
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(o => o.Inicio);

            builder.Property(o => o.Fin);

            builder.HasOne(o => o.TipoOperacion)
               .WithMany()
               .HasForeignKey(o => o.IdTipoOperacion)
               .HasConstraintName("FK_operacion_tipo")
               .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<Articulo>()
                .WithMany(a => a.Operaciones)
                .HasForeignKey(o => o.IdArticulo)
                .HasConstraintName("FK_operacion_articulo")
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
