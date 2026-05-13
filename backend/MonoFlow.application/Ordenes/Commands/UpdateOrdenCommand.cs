using MediatR;
using System;
using System.Text.Json.Serialization;
using MonoFlow.application.Common;

namespace MonoFlow.application.Ordenes.Commands
{
    public class UpdateOrdenCommand : IRequest<CommandResult>
    {
        [JsonIgnore]
        public Guid Id { get; set; }
        public string? Descripcion { get; set; }
        public string? Cliente { get; set; }
        public string? CodigoProcedencia{ get; set; }
    }
}
