using MonoFlow.application.Common;
using MonoFlow.domain.Aggregates.Operarios;
using MediatR;

namespace MonoFlow.application.Operarios.Commands
{
    public record CreateOperarioCommand(int NumeroOperario, string Nombre) : IRequest<CommandResult<Operario>>;
}

