using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace MonoFlow.application.RegistrosTrabajo.Commands
{
    public class FinalizarRegistroTrabajoCommand : IRequest<bool>
    {
        [JsonIgnore]
        public Guid OperacionId { get; set; }
    }
}
