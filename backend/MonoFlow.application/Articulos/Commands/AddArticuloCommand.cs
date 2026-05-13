using MonoFlow.domain.Aggregates.Result;
using MediatR;
using System;
using System.Text.Json.Serialization;
using MonoFlow.application.Common;

namespace MonoFlow.application.Articulos.Commands
{
    public class AddArticuloCommand : IRequest<CommandResult<Guid>>
    {
        [JsonIgnore]
        public Guid OrdenId { get; set; }
        public string Referencia { get; set; } = null!;
        public int Linea { get; set; }
        public int Cantidad { get; set; }
        public string? Descripcion { get; set; }
        public DateTime? InicioPlan { get; set; }
        public DateTime? FinPlan { get; set; }
    }
}
