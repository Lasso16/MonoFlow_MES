using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.Operarios.DTOs;
using MonoFlow.application.RegistrosTrabajo.Commands;
using MonoFlow.application.RegistrosTrabajo.DTOs;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.domain.Aggregates.TiposIncidencia;
using MonoFlow.domain.Aggregates.TiposEvento;

using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.RegistrosTrabajo.Handlers
{
    public class RegistrarIncidenciaHandler : IRequestHandler<RegistrarIncidenciaCommand, IncidenciaDTO>
    {
        private readonly IRegistroTrabajoRepository _registroRepo;
        private readonly ITipoIncidenciaRepository _tipoIncidenciaRepo;
        private readonly IOperacionRepository _operacionRepo;

        public RegistrarIncidenciaHandler(
            IRegistroTrabajoRepository registroRepo,
            ITipoIncidenciaRepository tipoIncidenciaRepo,
            IOperacionRepository operacionRepo)
        {
            _registroRepo = registroRepo;
            _tipoIncidenciaRepo = tipoIncidenciaRepo;
            _operacionRepo = operacionRepo;
        }

        public async Task<IncidenciaDTO> Handle(RegistrarIncidenciaCommand request, CancellationToken cancellationToken)
        {
            var registro = await _registroRepo.GetRegistroActivoPorOperacionAsync(request.OperacionId);

            if (registro == null) throw new Exception("No hay operacion activa.");

            registro.RegistrarIncidencia(request.IdTipoIncidencia, request.Comentario);

            var operacion = await _operacionRepo.GetByIdAsync(request.OperacionId);
            if (operacion != null)
            {
                operacion.ProcesarInicioEvento(TiposEventoEstandar.Incidencia, DateTime.Now);
            }

            await _registroRepo.UnitOfWork.SaveEntitiesAsync(cancellationToken);

            var tipoIncidencia = await _tipoIncidenciaRepo.GetByIdAsync(request.IdTipoIncidencia);

            var eventoActual = registro.Eventos.FirstOrDefault(e => !e.Fin.HasValue && e.IdTipoEvento == 3);
            var incidencia = eventoActual?.Incidencias.LastOrDefault();

            if (incidencia == null) throw new Exception("Error al registrar incidencia.");

            return new IncidenciaDTO
            {
                GuidIncidencia = incidencia.Id,
                IdTipoIncidencia = request.IdTipoIncidencia,
                NombreTipoIncidencia = tipoIncidencia?.Tipo ?? string.Empty,
                Comentario = request.Comentario,
                IdOperario = null
            };
        }
    }
}