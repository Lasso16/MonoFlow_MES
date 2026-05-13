using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Common
{
    public interface ICommandValidator<in TRequest>
    {
        Task<CommandResult> ValidateAsync(TRequest request, CancellationToken cancellationToken = default);
    }
}
