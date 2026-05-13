using MonoFlow.application.RegistrosTrabajo.Commands;
using MonoFlow.application.RegistrosTrabajo.DTOs;
using MonoFlow.application.Operarios.DTOs;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.domain.Aggregates.TiposRechazo;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
namespace MonoFlow.application.RegistrosTrabajo.Handlers
{
    public class RegistrarRechazoHandler : IRequestHandler<RegistrarRechazoCommand, RechazoDTO>
    {
        private readonly IRegistroTrabajoRepository _registroRepo;
        private readonly IOperacionRepository _operacionRepo;
        private readonly ITipoRechazoRepository _tipoRechazoRepo;

        public RegistrarRechazoHandler(
            IRegistroTrabajoRepository registroRepo, 
            IOperacionRepository operacionRepo, 
            ITipoRechazoRepository tipoRechazoRepo)
        {
            _registroRepo = registroRepo;
            _operacionRepo = operacionRepo;
            _tipoRechazoRepo = tipoRechazoRepo;
        }

        public async Task<RechazoDTO> Handle(RegistrarRechazoCommand request, CancellationToken cancellationToken)
        {
            var registro = await _registroRepo.GetRegistroActivoPorOperacionAsync(request.idOperacion);
            if (registro == null)
                throw new Exception("No hay un registro de trabajo activo para esta operacion.");

            var operacion = await _operacionRepo.GetByIdWithRegistrosAsync(request.idOperacion);
            if (operacion != null)
            {
                int totalOk = operacion.Registros.Sum(r => r.TotalProducidoOk);
                int totalRechazo = operacion.Registros.Sum(r => r.TotalRechazado);
                if ((totalOk + totalRechazo + request.Cantidad) > operacion.CantidadTotal)
                {
                    throw new InvalidOperationException("La cantidad introducida supera la cantidad total de la operación. (Producido+Rechazo >= CantidadTotal)");
                }
            }

            registro.RegistrarRechazo(request.Cantidad, request.IdTipoRechazo, request.Comentario ?? string.Empty);
            await _registroRepo.UnitOfWork.SaveEntitiesAsync(cancellationToken);
            var rechazo = registro.Rechazos.LastOrDefault();
            var tipoRechazo = await _tipoRechazoRepo.GetByIdAsync(request.IdTipoRechazo);
            return new RechazoDTO
            {
                IdRegistro = registro.Id,
                IdTipoRechazo = request.IdTipoRechazo,
                NombreTipoRechazo = tipoRechazo?.Motivo ?? string.Empty,
                Cantidad = request.Cantidad,
                TotalProducidoOk = registro.TotalProducidoOk,
                TotalRechazado = registro.TotalRechazado,
                Comentario = rechazo?.Comentario ?? request.Comentario ?? string.Empty,
                Timestamp = rechazo?.Timestamp ?? DateTime.Now,
                IdOperario = null
            };
        }
    }
}
