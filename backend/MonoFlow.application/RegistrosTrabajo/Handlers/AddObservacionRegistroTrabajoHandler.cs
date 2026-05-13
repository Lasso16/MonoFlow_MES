using MonoFlow.application.RegistrosTrabajo.Commands;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MediatR;

namespace MonoFlow.application.RegistrosTrabajo.Handlers
{
    public class AddObservacionRegistroTrabajoHandler : IRequestHandler<AddObservacionRegistroTrabajoCommand, string>
    {
        private readonly IRegistroTrabajoRepository _registroRepo;

        public AddObservacionRegistroTrabajoHandler(IRegistroTrabajoRepository registroRepo)
        {
            _registroRepo = registroRepo;
        }

        public async Task<string> Handle(AddObservacionRegistroTrabajoCommand request, CancellationToken cancellationToken)
        {
            var registro = await _registroRepo.GetRegistroActivoPorOperacionAsync(request.OperacionId);

            if (registro == null)
            {
                throw new Exception("No hay ningun registro de trabajo activo para esta operacion.");
            }

            registro.AgregarObservacion(request.Observacion);

            await _registroRepo.UnitOfWork.SaveEntitiesAsync(cancellationToken);

            return registro.Observaciones ?? string.Empty;
        }
    }
}