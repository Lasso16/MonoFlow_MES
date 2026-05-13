using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;
using MonoFlow.application.Common;

namespace MonoFlow.application.RegistrosTrabajo.Commands
{
    public class CerrarSesionOperarioCommand : IRequest<CommandResult>
    {
        [JsonIgnore]
        public Guid OperarioId { get; set; }
    }
}
