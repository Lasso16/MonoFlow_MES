using MonoFlow.application.Common;
using MonoFlow.application.Operarios.Commands;
using MonoFlow.application.Operarios.DTOs;
using MonoFlow.domain.Aggregates.Operarios;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operarios.Handlers
{
    public class UpdateOperarioDataHandler : IRequestHandler<UpdateOperarioDataCommand, CommandResult<OperarioDTO>>
    {
        private readonly IOperarioRepository _operarioRepository;
        private readonly ICommandValidator<UpdateOperarioDataCommand> _validator;

        public UpdateOperarioDataHandler(IOperarioRepository operarioRepository, ICommandValidator<UpdateOperarioDataCommand> validator)
        {
            _operarioRepository = operarioRepository;
            _validator = validator;
        }

        public async Task<CommandResult<OperarioDTO>> Handle(UpdateOperarioDataCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.Success)
                return CommandResult<OperarioDTO>.Fail(validationResult.Message);

            var operario = await _operarioRepository.GetByIdAsync(request.Id);
            if (operario == null) 
                return CommandResult<OperarioDTO>.Fail($"No se encontró el operario con Id {request.Id}");

            if (!string.IsNullOrWhiteSpace(request.Nombre))
            {
                operario.CambiarNombre(request.Nombre);
            }

            if (request.NumeroOperario.HasValue && request.NumeroOperario != operario.NumeroOperario)
            {
                var existente = await _operarioRepository.GetByNumeroAsync(request.NumeroOperario.Value);
                if (existente != null)
                {
                    return CommandResult<OperarioDTO>.Fail($"El número {request.NumeroOperario} ya está en uso por {existente.Nombre}.");
                }

                operario.SetNumero(request.NumeroOperario.Value);
            }

            bool saved = await _operarioRepository.UnitOfWork.SaveEntitiesAsync(cancellationToken);
            if (!saved)
                return CommandResult<OperarioDTO>.Fail("Error al guardar los cambios del operario.");

            var dto = new OperarioDTO
            {
                Id = operario.Id,
                NumeroOperario = operario.NumeroOperario,
                Nombre = operario.Nombre,
                Activo = operario.Activo,
                Rol = operario.Rol.ToString()
            };

            return CommandResult<OperarioDTO>.Ok(dto);
        }
    }
}
