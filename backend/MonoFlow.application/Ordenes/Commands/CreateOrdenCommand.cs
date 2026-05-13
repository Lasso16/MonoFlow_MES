using MediatR;
using System;
using MonoFlow.application.Common;

namespace MonoFlow.application.Ordenes.Commands
{
    public class CreateOrdenCommand : IRequest<CommandResult<Guid>>
    {
        public string IdNavision { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string? Cliente { get; set; }
        public string? CodigoProcedencia { get; set; }
    }
}
