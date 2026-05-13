using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.Operaciones.DTOs;
using MonoFlow.application.Operaciones.Queries;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operaciones.Handlers
{
    public class GetOperacionByIdHandler : IRequestHandler<GetOperacionByIdQuery, Result<OperacionDTO>>
    {
        private readonly IAppDbContext _context;

        public GetOperacionByIdHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<OperacionDTO>> Handle(GetOperacionByIdQuery request, CancellationToken cancellationToken)
        {
            var operacion = await _context.OperacionesRead
                .AsNoTracking()
                .Where(o => o.Id == request.Id)
                .Include(o => o.TipoOperacion)
                .Include(o => o.Registros)
                    .ThenInclude(r => r.Producciones)
                .FirstOrDefaultAsync(cancellationToken);

            if (operacion == null)
            {
                return Result.NotFoundFailure<OperacionDTO>("Operación no encontrada.");
            }

            var cantidadTotal = (int)operacion.CantidadTotal;
            var cantidadProducida = operacion.Registros
                .SelectMany(r => r.Producciones)
                .Sum(p => (int)p.CantidadOk);
            var cantidadRechazada = operacion.Registros
                .Sum(r => (int)r.TotalRechazado);

            var dto = new OperacionDTO
            {
                Id = operacion.Id,
                IdArticulo = operacion.IdArticulo,
                IdTipoOperacion = operacion.IdTipoOperacion,
                TipoOperacion = operacion.TipoOperacion != null ? operacion.TipoOperacion.Tipo : string.Empty,
                CantidadTotal = cantidadTotal,
                Estado = operacion.Estado ?? EstadoOperacion.Pendiente,
                TiempoPlan = operacion.TiempoPlan,
                TiempoTotal = operacion.TiempoTotal,
                UltimaOperacion = operacion.UltimaOperacion,
                CantidadComponentes = operacion.CantidadComponentes is null ? null : (int?)operacion.CantidadComponentes,
                CantidadProducida = cantidadProducida,
                CantidadRechazada = cantidadRechazada,
                Progreso = cantidadTotal > 0
                    ? System.Math.Min(100d, (double)(cantidadProducida + cantidadRechazada) / cantidadTotal * 100)
                    : 0,
                Inicio = operacion.Inicio,
                Fin = operacion.Fin
            };

            return Result.Success(dto);
        }
    }
}
