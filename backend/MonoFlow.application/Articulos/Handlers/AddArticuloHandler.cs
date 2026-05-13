using MonoFlow.application.Articulos.Commands;
using MonoFlow.application.Common;
using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Articulos.Handlers
{
    public class AddArticuloHandler : IRequestHandler<AddArticuloCommand, CommandResult<Guid>>
    {
        private readonly IArticuloRepository _articuloRepository;
        private readonly IOrdenRepository _ordenRepository;
        private readonly ICommandValidator<AddArticuloCommand> _validator;

        public AddArticuloHandler(IArticuloRepository articuloRepository, IOrdenRepository ordenRepository, ICommandValidator<AddArticuloCommand> validator)
        {
            _articuloRepository = articuloRepository;
            _ordenRepository = ordenRepository;
            _validator = validator;
        }

        public async Task<CommandResult<Guid>> Handle(AddArticuloCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.Success)
                return CommandResult<Guid>.Fail(validationResult.Message);

            var orden = await _ordenRepository.GetByIdAsync(request.OrdenId);
            if (orden == null)
                return CommandResult<Guid>.Fail($"No se encontró la orden con Id {request.OrdenId}");

            var exists = await _articuloRepository.ExistsByOrdenReferenciaLineaAsync(
                request.OrdenId,
                request.Referencia,
                request.Linea);

            if (exists)
            {
                return CommandResult<Guid>.Fail(
                    $"Ya existe un artículo con referencia '{request.Referencia}' en la línea {request.Linea} para esta orden.");
            }

            var articulo = new Articulo(
                request.OrdenId,
                request.Referencia,
                request.Linea,
                request.Cantidad,
                request.Descripcion);

            if (request.InicioPlan.HasValue && request.FinPlan.HasValue)
            {
                articulo.EstablecerPlanificacion(request.InicioPlan.Value, request.FinPlan.Value);
            }

            await _articuloRepository.AddAsync(articulo);
            bool saved;

            try
            {
                saved = await _articuloRepository.UnitOfWork.SaveEntitiesAsync(cancellationToken);
            }
            catch (DbUpdateException ex) when (IsDuplicateArticuloByOrdenReferenciaLinea(ex))
            {
                return CommandResult<Guid>.Fail(
                    $"Ya existe un artículo con referencia '{request.Referencia}' en la línea {request.Linea} para esta orden.");
            }

            if (!saved)
                return CommandResult<Guid>.Fail("Error al guardar el nuevo artículo.");

            return CommandResult<Guid>.Ok(articulo.Id);
        }

        private static bool IsDuplicateArticuloByOrdenReferenciaLinea(DbUpdateException ex)
        {
            var message = ex.InnerException?.Message ?? ex.Message;

            return message.Contains("UK_articulo_orden_ref_linea", StringComparison.OrdinalIgnoreCase)
                || message.Contains("clave duplicada", StringComparison.OrdinalIgnoreCase)
                || message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase);
        }
    }
}
