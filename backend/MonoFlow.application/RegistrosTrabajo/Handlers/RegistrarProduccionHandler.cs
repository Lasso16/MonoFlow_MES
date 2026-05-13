using MonoFlow.application.RegistrosTrabajo.Commands;
using MonoFlow.application.RegistrosTrabajo.DTOs;
using MonoFlow.application.Operarios.DTOs;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
namespace MonoFlow.application.RegistrosTrabajo.Handlers
{
    public class RegistrarProduccionHandler : IRequestHandler<RegistrarProduccionCommand, ProduccionDTO>
    {
        private readonly IRegistroTrabajoRepository _registroRepo;
        private readonly IOperacionRepository _operacionRepo;
        public RegistrarProduccionHandler(IRegistroTrabajoRepository registroRepo, IOperacionRepository operacionRepo)
        {
            _registroRepo = registroRepo;
            _operacionRepo = operacionRepo;
        }
        public async Task<ProduccionDTO> Handle(RegistrarProduccionCommand request, CancellationToken cancellationToken)
        {
            var registro = await _registroRepo.GetRegistroActivoPorOperacionAsync(request.idOperacion);
            if (registro == null) throw new Exception("No hay un registro activo.");

            var operacion = await _operacionRepo.GetByIdWithRegistrosAsync(request.idOperacion);
            if (operacion != null)
            {
                int totalOk = operacion.Registros.Sum(r => r.TotalProducidoOk);
                int totalRechazo = operacion.Registros.Sum(r => r.TotalRechazado);
                if ((totalOk + totalRechazo + request.Cantidad) > operacion.CantidadTotal)
                {
                    throw new InvalidOperationException("La cantidad introducida supera la cantidad total de la operación.");
                }
            }

            registro.RegistrarProduccion(request.Cantidad);
            await _registroRepo.UnitOfWork.SaveEntitiesAsync(cancellationToken);
            var produccion = registro.Producciones.LastOrDefault();
            return new ProduccionDTO
            {
                IdRegistro = registro.Id,
                Cantidad = request.Cantidad,
                TotalProducidoOk = registro.TotalProducidoOk,
                TotalRechazado = registro.TotalRechazado,
                Timestamp = produccion?.Timestamp ?? DateTime.Now,
                IdOperario = null
            };
        }
    }
}
