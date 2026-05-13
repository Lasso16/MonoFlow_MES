using MediatR;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using MonoFlow.application.RegistrosTrabajo.DTOs;
using MonoFlow.application.Common;

namespace MonoFlow.application.RegistrosTrabajo.Commands
{
    public class AbrirRegistroTrabajoCommand : IRequest<CommandResult<RegistroTrabajoDTO>>
    {
        [JsonIgnore]
        public Guid OperacionId { get; set; }
        public List<Guid> IdOperarios { get; set; } = new List<Guid>();
    }
}
