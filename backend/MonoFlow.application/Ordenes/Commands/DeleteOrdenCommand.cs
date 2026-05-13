using MonoFlow.application.Common;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace MonoFlow.application.Ordenes.Commands
{
    public record DeleteOrdenCommand(Guid Id) : IRequest<CommandResult>;
}