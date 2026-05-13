using MonoFlow.application.RegistrosTrabajo.DTOs;
using MonoFlow.application.RegistrosTrabajo.Queries;
using MonoFlow.application.Common.Interfaces;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace MonoFlow.application.RegistrosTrabajo.Handlers
{
    public class GetRegistroActivoOperarioHandler : IRequestHandler<GetRegistroActivoOperarioQuery, RegistroActivoOperarioDTO?>
    {
        private readonly IAppDbContext _context;

        public GetRegistroActivoOperarioHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<RegistroActivoOperarioDTO?> Handle(GetRegistroActivoOperarioQuery request, CancellationToken cancellationToken)
        {
            return await _context.SesionesOperarioRead
                .AsNoTracking()
                .Where(s => s.IdOperario == request.OperarioId && !s.Fin.HasValue)
                .Join(
                    _context.RegistrosTrabajoRead.AsNoTracking(),
                    sesion => sesion.IdRegistro,
                    registro => registro.Id,
                    (sesion, registro) => new RegistroActivoOperarioDTO
                    {
                        IdRegistro = registro.Id,
                        IdOperacion = registro.IdOperacion,
                        InicioRegistro = registro.Inicio,
                        InicioSesionOperario = sesion.Inicio
                    })
                .OrderByDescending(r => r.InicioSesionOperario)
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
