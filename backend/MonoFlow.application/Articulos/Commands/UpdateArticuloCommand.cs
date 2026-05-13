using MonoFlow.application.Articulos.DTOs;
using MonoFlow.domain.Aggregates.Result;
using MonoFlow.domain.Aggregates.Articulos;
using MediatR;
using System;
using System.Text.Json.Serialization;
using MonoFlow.application.Common;

namespace MonoFlow.application.Articulos.Commands
{
    public class UpdateArticuloCommand : IRequest<CommandResult<Articulo>>
    {
        [JsonIgnore]
        public Guid Id { get; set; }
        public int Cantidad { get; set; }
        public string? Descripcion { get; set; }
        public DateTime? InicioPlan { get; set; }
        public DateTime? FinPlan { get; set; }
    }
}
