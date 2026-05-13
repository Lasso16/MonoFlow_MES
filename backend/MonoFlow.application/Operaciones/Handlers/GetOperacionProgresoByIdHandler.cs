using MonoFlow.application.Operaciones.DTOs;
using MonoFlow.application.Operaciones.Queries;
using MonoFlow.application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operaciones.Handlers
{
    public class GetOperacionProgresoByIdHandler : IRequestHandler<GetOperacionProgresoByIdQuery, OperacionProgresoDTO?>
    {
        private readonly IAppDbContext _context;

        public GetOperacionProgresoByIdHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<OperacionProgresoDTO?> Handle(GetOperacionProgresoByIdQuery request, CancellationToken cancellationToken)
        {
            var operacion = await _context.OperacionesRead
                .AsNoTracking()
                .Where(o => o.Id == request.Id)
                .Include(o => o.Registros)
                .FirstOrDefaultAsync(cancellationToken);

            if (operacion == null)
            {
                return null;
            }

            return new OperacionProgresoDTO
            {
                Id = operacion.Id,
                CantidadReal = operacion.Registros.Sum(r => (int)r.TotalProducidoOk),
                TiempoReal = operacion.TiempoTotal
            };
        }
    }
}
