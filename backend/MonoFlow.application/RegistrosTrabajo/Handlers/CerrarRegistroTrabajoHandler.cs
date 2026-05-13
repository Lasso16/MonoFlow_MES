using MonoFlow.application.RegistrosTrabajo.Commands;
using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;

using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.RegistrosTrabajo.Handlers
{
    public class FinalizarRegistroTrabajoHandler : IRequestHandler<FinalizarRegistroTrabajoCommand, bool>
    {
        private readonly IRegistroTrabajoRepository _registroRepo;
        private readonly IOperacionRepository _operacionRepo;
        private readonly IArticuloRepository _articuloRepo;
        private readonly IOrdenRepository _ordenRepo;

        public FinalizarRegistroTrabajoHandler(
            IRegistroTrabajoRepository registroRepo,
            IOperacionRepository operacionRepo,
            IArticuloRepository articuloRepo,
            IOrdenRepository ordenRepo)
        {
            _registroRepo = registroRepo;
            _operacionRepo = operacionRepo;
            _articuloRepo = articuloRepo;
            _ordenRepo = ordenRepo;
        }

        public async Task<bool> Handle(FinalizarRegistroTrabajoCommand request, CancellationToken cancellationToken)
        {
            var registro = await _registroRepo.GetRegistroActivoPorOperacionAsync(request.OperacionId);

            if (registro == null)
                throw new Exception("No hay ningun registro de trabajo activo para esta operacion.");

            registro.Finalizar();

            var operacion = await _operacionRepo.GetByIdWithRegistrosAsync(request.OperacionId);
            if (operacion != null)
            {
                operacion.EvaluarPasoADetenido();

                var articulo = await _articuloRepo.GetByOperacionIdAsync(request.OperacionId);
                if (articulo != null)
                {
                    articulo.ActualizarEstado();
                }

                var orden = await _ordenRepo.GetOrdenByOperacionIdAsync(request.OperacionId);
                if (orden != null)
                {
                    orden.ActualizarEstadoSegunOperaciones();
                }
            }

            return await _registroRepo.UnitOfWork.SaveEntitiesAsync(cancellationToken);
        }
    }
}