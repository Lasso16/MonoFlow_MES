using MonoFlow.domain.Aggregates.Operaciones;
using MediatR;
using System;
using System.Text.Json.Serialization;

namespace MonoFlow.application.Operaciones.Commands
{
    public class UpdateOperacionCommand : IRequest<Operacion?>
    {
        [JsonIgnore]
        public Guid Id { get; set; }
        public int? CantidadComponentes { get; set; }
        public double? TiempoPlan { get; set; }
    }
}
