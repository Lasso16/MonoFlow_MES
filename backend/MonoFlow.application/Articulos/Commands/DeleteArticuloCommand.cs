using MonoFlow.application.Common;
using MediatR;
using System;

namespace MonoFlow.application.Articulos.Commands
{
    public record DeleteArticuloCommand(Guid Id) : IRequest<CommandResult>;
}
