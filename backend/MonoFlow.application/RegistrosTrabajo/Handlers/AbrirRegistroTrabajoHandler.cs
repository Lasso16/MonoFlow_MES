using MonoFlow.application.RegistrosTrabajo.Commands;
using MonoFlow.application.RegistrosTrabajo.DTOs;
using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Operarios;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.application.Common;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.RegistrosTrabajo.Handlers
{
    public class AbrirRegistroTrabajoHandler : IRequestHandler<AbrirRegistroTrabajoCommand, CommandResult<RegistroTrabajoDTO>>
    {
        private readonly IRegistroTrabajoRepository _registroRepo;
        private readonly IArticuloRepository _articuloRepo;
        private readonly IOperarioRepository _operarioRepo;
        private readonly IOperacionRepository _operacionRepo;
        private readonly IOrdenRepository _ordenRepo;

        public AbrirRegistroTrabajoHandler(
            IRegistroTrabajoRepository registroRepo,
            IArticuloRepository articuloRepo,
            IOperarioRepository operarioRepo,
            IOperacionRepository operacionRepo,
            IOrdenRepository ordenRepo)
        {
            _registroRepo = registroRepo;
            _articuloRepo = articuloRepo;
            _operarioRepo = operarioRepo;
            _operacionRepo = operacionRepo;
            _ordenRepo = ordenRepo;
        }

        public async Task<CommandResult<RegistroTrabajoDTO>> Handle(AbrirRegistroTrabajoCommand request, CancellationToken ct)
        {
            var operacion = await _operacionRepo.GetByIdAsync(request.OperacionId);
            if (operacion == null) return CommandResult<RegistroTrabajoDTO>.Fail("Operación no encontrada.");

            var operariosData = await _operarioRepo.GetByIdsAsync(request.IdOperarios);
            foreach (var idOp in request.IdOperarios)
            {
                var op = operariosData.FirstOrDefault(o => o.Id == idOp);
                if (op == null) return CommandResult<RegistroTrabajoDTO>.Fail($"Operario {idOp} no encontrado.");

                if (await _operarioRepo.HasSesionesAsync(idOp))
                {
                    return CommandResult<RegistroTrabajoDTO>.Fail($"El operario {op.Nombre} ({op.NumeroOperario}) ya tiene una sesión abierta.");
                }
            }

            var registroExistente = await _registroRepo.GetRegistroActivoPorOperacionAsync(request.OperacionId);
            RegistroTrabajo registroActivo;
            DateTime fechaInicio;

            if (registroExistente != null)
            {
                registroActivo = registroExistente;
                fechaInicio = registroExistente.Inicio;
                foreach (var idOp in request.IdOperarios)
                {
                    if (!registroActivo.Sesiones.Any(s => s.IdOperario == idOp && !s.Fin.HasValue))
                        registroActivo.AbrirSesion(idOp);
                }
            }
            else
            {
                fechaInicio = DateTime.Now;
                registroActivo = RegistroTrabajo.Create(request.OperacionId, request.IdOperarios);
                operacion.AgregarRegistro(registroActivo);
                operacion.IniciarDesdeRegistro(fechaInicio);

                var articulo = await _articuloRepo.GetByIdWithOperacionesAsync(operacion.IdArticulo);
                if (articulo != null)
                    articulo.ActualizarEstado();

                var orden = await _ordenRepo.GetOrdenByArticuloIdAsync(operacion.IdArticulo);
                if (orden != null && orden.Estado == EstadoOrden.PENDIENTE)
                    orden.Iniciar();
            }

            await _operacionRepo.UnitOfWork.SaveEntitiesAsync(ct);

            var activeIds = registroActivo.Sesiones.Where(s => !s.Fin.HasValue).Select(s => s.IdOperario);
            var nombresOperarios = operariosData
                .Where(o => activeIds.Contains(o.Id))
                .Select(o => o.Nombre)
                .ToList();

            var dto = new RegistroTrabajoDTO
            {
                IdRegistro = registroActivo.Id,
                IdOperacion = request.OperacionId,
                Inicio = fechaInicio,
                Operarios = nombresOperarios
            };

            return CommandResult<RegistroTrabajoDTO>.Ok(dto, "Sesión iniciada correctamente.");
        }
    }
}
