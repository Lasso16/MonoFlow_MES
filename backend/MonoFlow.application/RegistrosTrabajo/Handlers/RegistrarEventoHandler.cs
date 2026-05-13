using MonoFlow.application.RegistrosTrabajo.Commands;
using MonoFlow.application.RegistrosTrabajo.DTOs;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.application.Operarios.DTOs;
using MonoFlow.domain.Aggregates.Eventos;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.domain.Aggregates.TiposEvento;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
namespace MonoFlow.application.RegistrosTrabajo.Handlers
{
    public class RegistrarEventoHandler : IRequestHandler<RegistrarEventoCommand, EventoDTO>
    {
        private readonly IRegistroTrabajoRepository _registroRepo;
        private readonly ITipoEventoRepository _tipoEventoRepo;
        private readonly IOperacionRepository _operacionRepo;

        public RegistrarEventoHandler(
            IRegistroTrabajoRepository registroRepo,
            ITipoEventoRepository tipoEventoRepo,
            IOperacionRepository operacionRepo)
        {
            _registroRepo = registroRepo ?? throw new ArgumentNullException(nameof(registroRepo));
            _tipoEventoRepo = tipoEventoRepo ?? throw new ArgumentNullException(nameof(tipoEventoRepo));
            _operacionRepo = operacionRepo ?? throw new ArgumentNullException(nameof(operacionRepo));
        }
        public async Task<EventoDTO> Handle(RegistrarEventoCommand request, CancellationToken cancellationToken)
        {
            var registro = await _registroRepo.GetRegistroActivoPorOperacionAsync(request.OperacionId);
            if (registro == null)
            {
                throw new Exception($"No se encontro un registro de trabajo activo para la operacion {request.OperacionId}");
            }

            var eventoActivoAnterior = registro.Eventos.FirstOrDefault(e => !e.Fin.HasValue);
            var nuevoEvento = registro.RegistrarEvento(request.IdTipoEvento);

            var operacion = await _operacionRepo.GetByIdAsync(request.OperacionId);
            if (operacion != null)
            {
                if (eventoActivoAnterior != null)
                {
                    operacion.ProcesarFinEvento(eventoActivoAnterior.IdTipoEvento, nuevoEvento.Inicio);
                }

                operacion.ProcesarInicioEvento(request.IdTipoEvento, nuevoEvento.Inicio);
            }

            var guardado = await _registroRepo.UnitOfWork.SaveEntitiesAsync(cancellationToken);
            if (guardado)
            {
                var tipoEvento = await _tipoEventoRepo.GetByIdAsync(request.IdTipoEvento);
                return new EventoDTO
                {
                    IdEvento = nuevoEvento.Id,
                    IdTipoEvento = nuevoEvento.IdTipoEvento,
                    NombreTipoEvento = tipoEvento?.Tipo ?? string.Empty,
                    Inicio = nuevoEvento.Inicio,
                    Fin = nuevoEvento.Fin,
                    IdOperario = null
                };
            }
            throw new Exception("Hubo un problema al guardar el evento en la base de datos.");
        }
    }
}
