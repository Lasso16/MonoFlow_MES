using MediatR;
using System;
using System.Text.Json.Serialization;
using MonoFlow.application.Common;

namespace MonoFlow.application.Operaciones.Commands
{
    public class AddOperacionCommand : IRequest<CommandResult<Guid>>
    {
        [JsonIgnore]
        public Guid ArticuloId { get; set; }
        public int IdTipoOperacion { get; set; }
        public double? TiempoPlan { get; set; }
        public bool UltimaOperacion { get; set; }
        public int? CantidadComponentes { get; set; }
    }
}
