using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MonoFlow.infrastructure.EntityConfigurations
{
    public class RegistroConfiguration : IEntityTypeConfiguration<RegistroTrabajo>
    {
        public void Configure(EntityTypeBuilder<RegistroTrabajo> builder)
        {
            builder.ToTable("registros_trabajo", AppDbContext.DEFAULT_SCHEMA);

            builder.HasKey(r => r.Id);
            builder.Property(r => r.Id)
                .ValueGeneratedOnAdd();

            builder.Property(r => r.IdOperacion)
                .IsRequired();

            builder.Property(r => r.Inicio)
                .IsRequired();

            builder.Property(r => r.Fin);

            builder.Property(r => r.Finalizado)
                .HasDefaultValue(false);

            builder.Property(r => r.Observaciones)
                .HasMaxLength(1000);

            builder.Property(r => r.TotalProducidoOk)
                .HasConversion(c => c.Value, v => Cantidad.Create(v))
                .IsRequired();

            builder.Property(r => r.TotalRechazado)
                .HasConversion(c => c.Value, v => Cantidad.Create(v))
                .IsRequired();

            builder.HasOne<Operacion>()
                .WithMany()
                .HasForeignKey(r => r.IdOperacion)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(r => r.Sesiones)
                .WithOne()
                .HasForeignKey(s => s.IdRegistro)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(r => r.Eventos)
                .WithOne()
                .HasForeignKey(e => e.IdRegistro)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(r => r.Producciones)
                .WithOne()
                .HasForeignKey(p => p.IdRegistro)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(r => r.Rechazos)
                .WithOne()
                .HasForeignKey(re => re.IdRegistro)
                .OnDelete(DeleteBehavior.Cascade);

            var navigationSesiones = builder.Metadata.FindNavigation(nameof(RegistroTrabajo.Sesiones));
            navigationSesiones?.SetPropertyAccessMode(PropertyAccessMode.Field);

            var navigationEventos = builder.Metadata.FindNavigation(nameof(RegistroTrabajo.Eventos));
            navigationEventos?.SetPropertyAccessMode(PropertyAccessMode.Field);

            var navigationProducciones = builder.Metadata.FindNavigation(nameof(RegistroTrabajo.Producciones));
            navigationProducciones?.SetPropertyAccessMode(PropertyAccessMode.Field);

            var navigationRechazadas = builder.Metadata.FindNavigation(nameof(RegistroTrabajo.Rechazos));
            navigationRechazadas?.SetPropertyAccessMode(PropertyAccessMode.Field);
        }
    }
}
