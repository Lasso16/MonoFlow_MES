using MonoFlow.application.Operaciones.DTOs;
using MonoFlow.application.Operaciones.Queries;
using MonoFlow.application.Common.Interfaces;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operaciones.Handlers
{
    public class GetOperacionesByArticuloIdHandler : IRequestHandler<GetOperacionesByArticuloIdQuery, Result<List<OperacionDTO>>>
    {
        private readonly IAppDbContext _context;

        public GetOperacionesByArticuloIdHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<OperacionDTO>>> Handle(GetOperacionesByArticuloIdQuery request, CancellationToken cancellationToken)
        {
            var articulosExists = await _context.ArticulosRead
                .AsNoTracking()
                .AnyAsync(a => a.Id == request.ArticuloId, cancellationToken);

            if (!articulosExists)
            {
                return Result.NotFoundFailure<List<OperacionDTO>>("Artículo no encontrado.");
            }

            var operaciones = await _context.OperacionesRead
                .AsNoTracking()
                .Where(op => op.IdArticulo == request.ArticuloId)
                .Include(op => op.TipoOperacion)
                .Include(op => op.Registros)
                    .ThenInclude(r => r.Producciones)
                .ToListAsync(cancellationToken);

            var ops = operaciones
                .Select(op =>
                {
                    var cantidadTotal = (int)op.CantidadTotal;
                    var cantidadProducida = op.Registros
                        .SelectMany(r => r.Producciones)
                        .Sum(p => (int)p.CantidadOk);
                    var cantidadRechazada = op.Registros
                        .Sum(r => (int)r.TotalRechazado);

                    return new OperacionDTO
                    {
                        Id = op.Id,
                        IdArticulo = op.IdArticulo,
                        IdTipoOperacion = op.IdTipoOperacion,
                        TipoOperacion = op.TipoOperacion != null ? op.TipoOperacion.Tipo : "N/A",
                        CantidadTotal = cantidadTotal,
                        Estado = op.Estado ?? MonoFlow.domain.Aggregates.Common.EstadoOperacion.Pendiente,
                        TiempoPlan = op.TiempoPlan,
                        TiempoTotal = op.TiempoTotal,
                        UltimaOperacion = op.UltimaOperacion,
                        CantidadComponentes = op.CantidadComponentes is null ? null : (int?)op.CantidadComponentes,
                        Inicio = op.Inicio,
                        Fin = op.Fin,
                        CantidadProducida = cantidadProducida,
                        CantidadRechazada = cantidadRechazada,
                        Progreso = cantidadTotal > 0
                            ? System.Math.Min(100d, (double)(cantidadProducida + cantidadRechazada) / cantidadTotal * 100)
                            : 0,
                    };
                })
                .ToList();

            return Result.Success(ops);
        }
    }
}

