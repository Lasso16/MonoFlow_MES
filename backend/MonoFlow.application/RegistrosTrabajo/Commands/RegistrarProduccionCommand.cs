using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;
using MonoFlow.application.RegistrosTrabajo.DTOs;

namespace MonoFlow.application.RegistrosTrabajo.Commands
{
    public class RegistrarProduccionCommand : IRequest<ProduccionDTO>
    {
        [JsonIgnore]
        public Guid idOperacion { get; set; }
        public int Cantidad { get; set; }
    }
}
