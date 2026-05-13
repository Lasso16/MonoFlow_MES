using MediatR;
using System;
using MonoFlow.application.Common;

namespace MonoFlow.application.Ordenes.Commands
{
    public record FinalizarOrdenCommand(Guid Id) : IRequest<CommandResult>;
}
