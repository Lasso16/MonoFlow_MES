using MonoFlow.application.Common;
using MonoFlow.application.Operarios.Commands;
using MonoFlow.domain.Aggregates.Operarios;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operarios.Handlers
{
    public class CreateOperarioHandler : IRequestHandler<CreateOperarioCommand, CommandResult<Operario>>
    {
        private readonly IOperarioRepository _operarioRepository;
        private readonly ICommandValidator<CreateOperarioCommand> _validator;

        public CreateOperarioHandler(IOperarioRepository operarioRepository, ICommandValidator<CreateOperarioCommand> validator)
        {
            _operarioRepository = operarioRepository;
            _validator = validator;
        }

        public async Task<CommandResult<Operario>> Handle(CreateOperarioCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.Success)
                return CommandResult<Operario>.Fail(validationResult.Message);

            var operario = Operario.Create(request.NumeroOperario, request.Nombre);

            await _operarioRepository.AddAsync(operario);

            bool saved = await _operarioRepository.UnitOfWork.SaveEntitiesAsync(cancellationToken);

            if (!saved)
                return CommandResult<Operario>.Fail("Error al guardar un nuevo operario en la base de datos.");

            return CommandResult<Operario>.Ok(operario);
        }
    }
}

