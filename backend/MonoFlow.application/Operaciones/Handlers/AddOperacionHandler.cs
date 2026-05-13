using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Common;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using MonoFlow.application.Operaciones.Commands;
using MonoFlow.application.Common;

namespace MonoFlow.application.Operaciones.Handlers
{
    public class AddOperacionHandler : IRequestHandler<AddOperacionCommand, CommandResult<Guid>>
    {
        private readonly IOperacionRepository _operacionRepository;
        private readonly IArticuloRepository _articuloRepository;
        private readonly ICommandValidator<AddOperacionCommand> _validator;

        public AddOperacionHandler(IOperacionRepository operacionRepository, IArticuloRepository articuloRepository, ICommandValidator<AddOperacionCommand> validator)
        {
            _operacionRepository = operacionRepository;
            _articuloRepository = articuloRepository;
            _validator = validator;
        }

        public async Task<CommandResult<Guid>> Handle(AddOperacionCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.Success)
                return CommandResult<Guid>.Fail(validationResult.Message);

            var articulo = await _articuloRepository.GetByIdAsync(request.ArticuloId);
            if (articulo == null) 
                return CommandResult<Guid>.Fail($"No se encontró el artículo con Id {request.ArticuloId}");

            int cantidadTotal = articulo.Cantidad * (request.CantidadComponentes ?? 1);

            var operacion = new Operacion(
                request.ArticuloId,
                request.IdTipoOperacion,
                cantidadTotal,
                request.TiempoPlan,
                request.UltimaOperacion,
                request.CantidadComponentes);

            await _operacionRepository.AddAsync(operacion);
            bool saved = await _operacionRepository.UnitOfWork.SaveEntitiesAsync(cancellationToken);

            if (!saved)
                return CommandResult<Guid>.Fail("Error al guardar la nueva operación.");

            return CommandResult<Guid>.Ok(operacion.Id);
        }
    }
}
