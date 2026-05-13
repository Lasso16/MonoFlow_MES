using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;
using MonoFlow.application.RegistrosTrabajo.DTOs;

namespace MonoFlow.application.RegistrosTrabajo.Commands
{
    public class RegistrarRechazoCommand : IRequest<RechazoDTO>
    {
        [JsonIgnore]
        public Guid idOperacion { get; set; }
        public int Cantidad { get; set; }
        public int IdTipoRechazo { get; set; }
        public string? Comentario { get; set; }
    }
}
