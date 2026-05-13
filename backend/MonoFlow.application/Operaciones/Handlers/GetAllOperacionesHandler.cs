using MonoFlow.application.Common;
using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.Operaciones.DTOs;
using MonoFlow.application.Operaciones.Queries;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operaciones.Handlers
{
    public class GetAllOperacionesHandler : IRequestHandler<GetAllOperacionesQuery, Result<PagedResult<OperacionDTO>>>
    {
        private readonly IAppDbContext _context;

        public GetAllOperacionesHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult<OperacionDTO>>> Handle(GetAllOperacionesQuery request, CancellationToken cancellationToken)
        {
            var query = _context.OperacionesRead
                .AsNoTracking()
                .Where(o =>
                    (!request.Estado.HasValue || o.Estado == request.Estado.Value) &&
                    (!request.ArticuloId.HasValue || o.IdArticulo == request.ArticuloId.Value) &&
                    (!request.TipoOperacionId.HasValue || o.IdTipoOperacion == request.TipoOperacionId.Value) &&
                    (!request.FechaInicio.HasValue || (o.Inicio != null && o.Inicio >= request.FechaInicio.Value)) &&
                    (!request.FechaFin.HasValue || (o.Fin != null && o.Fin <= request.FechaFin.Value)));

            var total = await query.CountAsync(cancellationToken);

            var operaciones = await query
                .Include(o => o.TipoOperacion)
                .Include(o => o.Registros)
                    .ThenInclude(r => r.Producciones)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            var dtos = operaciones
                .Select(o =>
                {
                    var cantidadTotal = (int)o.CantidadTotal;
                    var cantidadProducida = o.Registros
                        .SelectMany(r => r.Producciones)
                        .Sum(p => (int)p.CantidadOk);
                    var cantidadRechazada = o.Registros
                        .Sum(r => (int)r.TotalRechazado);

                    return new OperacionDTO
                    {
                        Id = o.Id,
                        IdArticulo = o.IdArticulo,
                        IdTipoOperacion = o.IdTipoOperacion,
                        TipoOperacion = o.TipoOperacion != null ? o.TipoOperacion.Tipo : "N/A",
                        CantidadTotal = cantidadTotal,
                        Estado = o.Estado ?? EstadoOperacion.Pendiente,
                        TiempoPlan = o.TiempoPlan,
                        TiempoTotal = o.TiempoTotal,
                        UltimaOperacion = o.UltimaOperacion,
                        CantidadComponentes = o.CantidadComponentes is null ? null : (int?)o.CantidadComponentes,
                        CantidadProducida = cantidadProducida,
                        CantidadRechazada = cantidadRechazada,
                        Progreso = cantidadTotal > 0
                            ? System.Math.Min(100d, (double)(cantidadProducida + cantidadRechazada) / cantidadTotal * 100)
                            : 0,
                        Inicio = o.Inicio,
                        Fin = o.Fin
                    };
                })
                .ToList();

            return Result.Success(new PagedResult<OperacionDTO>
            {
                Items = dtos,
                TotalRecords = total,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            });
        }
    }
}
