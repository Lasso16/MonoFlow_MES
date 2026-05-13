using MediatR;
using System;
using System.Text.Json.Serialization;
using MonoFlow.application.RegistrosTrabajo.DTOs;

namespace MonoFlow.application.RegistrosTrabajo.Commands
{
    public class RegistrarIncidenciaCommand : IRequest<IncidenciaDTO>
    {
        [JsonIgnore]
        public Guid OperacionId { get; set; }
        public int IdTipoIncidencia { get; set; }
        public string? Comentario { get; set; }

        public RegistrarIncidenciaCommand() { }
        public RegistrarIncidenciaCommand(Guid operacionId, int idTipoIncidencia, string? comentario)
        {
            OperacionId = operacionId;
            IdTipoIncidencia = idTipoIncidencia;
            Comentario = comentario;
        }
    }
}