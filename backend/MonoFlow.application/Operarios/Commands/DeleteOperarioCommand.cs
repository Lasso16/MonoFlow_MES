using System;
using MediatR;
using MonoFlow.application.Common;

namespace MonoFlow.application.Operarios.Commands
{
    public class DeleteOperarioCommand : IRequest<CommandResult>
    {
        public Guid Id { get; }

        public DeleteOperarioCommand(Guid id)
        {
            Id = id;
        }
    }
}
