using System;
using MediatR;
using MonoFlow.application.Common;
using MonoFlow.application.Operarios.DTOs;
using System.Text.Json.Serialization;

namespace MonoFlow.application.Operarios.Commands
{
    public class UpdateOperarioDataCommand : IRequest<CommandResult<OperarioDTO>>
    {
        [JsonIgnore]
        public Guid Id { get; set; }
        public string? Nombre { get; set; }
        public int? NumeroOperario { get; set; }
    }
}
