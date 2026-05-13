using MonoFlow.application.Common;
using MonoFlow.application.Ordenes.Commands;
using MonoFlow.domain.Aggregates.Ordenes;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Ordenes.Handlers
{
    public class CreateOrdenHandler : IRequestHandler<CreateOrdenCommand, CommandResult<Guid>>
    {
        private readonly IOrdenRepository _ordenRepository;
        private readonly ICommandValidator<CreateOrdenCommand> _validator;

        public CreateOrdenHandler(IOrdenRepository ordenRepository, ICommandValidator<CreateOrdenCommand> validator)
        {
            _ordenRepository = ordenRepository;
            _validator = validator;
        }

        public async Task<CommandResult<Guid>> Handle(CreateOrdenCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.Success)
                return CommandResult<Guid>.Fail(validationResult.Message);

            var orden = new Orden(request.IdNavision, request.Descripcion, request.Cliente, request.CodigoProcedencia);
            
            await _ordenRepository.AddAsync(orden);
            bool saved = await _ordenRepository.UnitOfWork.SaveEntitiesAsync(cancellationToken);
            
            if (!saved) return CommandResult<Guid>.Fail("Error al guardar la nueva orden.");

            return CommandResult<Guid>.Ok(orden.Id);
        }
    }
}
