using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.ProduccionesRechazadas;
using MonoFlow.domain.Aggregates.TiposRechazo;
using MonoFlow.infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MonoFlow.infrastructure.EntityConfigurations
{
    public class RechazoConfiguration : IEntityTypeConfiguration<Rechazo>
    {
        public void Configure(EntityTypeBuilder<Rechazo> builder)
        {
            builder.ToTable("rechazos", AppDbContext.DEFAULT_SCHEMA);

            builder.HasKey(r => r.Id);
            builder.Property(r => r.Id)
                .ValueGeneratedOnAdd();

            builder.Property(r => r.IdRegistro)
                .IsRequired();

            builder.Property(r => r.IdTipoRechazo)
                .IsRequired();

            builder.Property(pr => pr.Timestamp)
                .IsRequired();

            builder.Property(pr => pr.CantidadRechazo)
                .HasConversion(c => c.Value, v => Cantidad.Create(v))
                .IsRequired();

            builder.Property(r => r.Comentario)
                .HasMaxLength(255);

                builder.HasOne(r => r.TipoRechazo)
                    .WithMany()
                    .HasForeignKey(r => r.IdTipoRechazo)
                    .HasConstraintName("FK_rechazadas_tipo")
                    .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
