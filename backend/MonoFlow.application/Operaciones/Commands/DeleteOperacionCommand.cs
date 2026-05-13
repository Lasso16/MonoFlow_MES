using MonoFlow.application.Common;
using MediatR;
using System;

namespace MonoFlow.application.Operaciones.Commands
{
    public class DeleteOperacionCommand : IRequest<CommandResult>
    {
        public Guid Id { get; set; }

        public DeleteOperacionCommand(Guid id)
        {
            Id = id;
        }
    }
}
