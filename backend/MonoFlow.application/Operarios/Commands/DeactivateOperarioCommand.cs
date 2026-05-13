using System;
using MediatR;
using MonoFlow.application.Common;

namespace MonoFlow.application.Operarios.Commands
{
    public class DeactivateOperarioCommand : IRequest<CommandResult>
    {
        public Guid Id { get; }

        public DeactivateOperarioCommand(Guid id)
        {
            Id = id;
        }
    }
}