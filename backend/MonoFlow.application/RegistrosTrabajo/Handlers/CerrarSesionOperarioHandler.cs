using MonoFlow.application.RegistrosTrabajo.Commands;
using MonoFlow.domain.Aggregates.Operarios;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.application.Common;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.RegistrosTrabajo.Handlers
{
    public class CerrarSesionOperarioHandler : IRequestHandler<CerrarSesionOperarioCommand, CommandResult>
    {
        private readonly IRegistroTrabajoRepository _registroRepo;
        private readonly IOperarioRepository _operarioRepo;
        private readonly IOperacionRepository _operacionRepo;
        private readonly IArticuloRepository _articuloRepo;
        private readonly IOrdenRepository _ordenRepo;

        public CerrarSesionOperarioHandler(
            IRegistroTrabajoRepository registroRepo, 
            IOperarioRepository operarioRepo,
            IOperacionRepository operacionRepo,
            IArticuloRepository articuloRepo,
            IOrdenRepository ordenRepo)
        {
            _registroRepo = registroRepo;
            _operarioRepo = operarioRepo;
            _operacionRepo = operacionRepo;
            _articuloRepo = articuloRepo;
            _ordenRepo = ordenRepo;
        }

        public async Task<CommandResult> Handle(CerrarSesionOperarioCommand request, CancellationToken cancellationToken)
        {
            var operario = await _operarioRepo.GetByIdAsync(request.OperarioId);
            if (operario == null) return CommandResult.Fail("Operario no encontrado.");

            var registro = await _registroRepo.GetRegistroConSesionActivaAsync(operario.Id);
            if (registro == null) return CommandResult.Fail("El operario no tiene ninguna sesión abierta.");

            // CerrarSesion puede disparar Finalizar si no quedan operarios activos,
            // lo cual dispara los domain events correspondientes
            registro.CerrarSesion(operario.Id);

            _registroRepo.Update(registro);

            if (registro.Finalizado)
            {
                var operacion = await _operacionRepo.GetByIdWithRegistrosAsync(registro.IdOperacion);
                if (operacion != null)
                {
                    operacion.EvaluarPasoADetenido();

                    var articulo = await _articuloRepo.GetByOperacionIdAsync(operacion.Id);
                    if (articulo != null)
                    {
                        articulo.ActualizarEstado();
                    }

                    var orden = await _ordenRepo.GetOrdenByOperacionIdAsync(operacion.Id);
                    if (orden != null)
                    {
                        orden.ActualizarEstadoSegunOperaciones();
                    }
                }
            }

            var result = await _registroRepo.UnitOfWork.SaveEntitiesAsync(cancellationToken);
            return result ? CommandResult.Ok("Sesión cerrada con éxito.") : CommandResult.Fail("Error al guardar los cambios.");
        }
    }
}