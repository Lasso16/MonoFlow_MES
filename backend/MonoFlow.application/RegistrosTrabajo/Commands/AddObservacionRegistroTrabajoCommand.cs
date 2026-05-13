using MediatR;
using System.Text.Json.Serialization;

namespace MonoFlow.application.RegistrosTrabajo.Commands
{
    public class AddObservacionRegistroTrabajoCommand : IRequest<string>
    {
        [JsonIgnore]
        public Guid OperacionId { get; set; }

        public string Observacion { get; set; } = string.Empty;
    }
}