using MonoFlow.application.Common;
using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.Ordenes.DTOs;
using MonoFlow.application.Ordenes.Queries;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Ordenes.Handlers
{
    public class GetAllOrdenesHandler : IRequestHandler<GetAllOrdenesQuery, Result<PagedResult<OrdenDTO>>>
    {
        private readonly IAppDbContext _context;

        public GetAllOrdenesHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult<OrdenDTO>>> Handle(GetAllOrdenesQuery request, CancellationToken cancellationToken)
        {
            var query = _context.OrdenesRead
                .AsNoTracking()
                .Where(o =>
                    (!request.Estado.HasValue || o.Estado == request.Estado.Value) &&
                    (string.IsNullOrEmpty(request.IdNavision) || o.IdNavision.Contains(request.IdNavision)) &&
                    (string.IsNullOrEmpty(request.Cliente) || (o.Cliente != null && o.Cliente.Contains(request.Cliente))));

            var totalRecords = await query.CountAsync(cancellationToken);

            var dtos = await query
                .Select(o => new OrdenDTO
                {
                    Id = o.Id,
                    IdNavision = o.IdNavision,
                    Estado = o.Estado.ToString(),
                    Descripcion = o.Descripcion,
                    Cliente = o.Cliente,
                    CodigoProcedencia = o.CodigoProcedencia,
                    Progreso = o.Articulos.Any()
                        ? (int)o.Articulos.Average(a =>
                            a.Operaciones.Any()
                                ? (double)a.Operaciones.Count(op => op.Estado == EstadoOperacion.FinProduccion) / a.Operaciones.Count() * 100
                                : 0)
                        : 0
                })
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            return Result.Success(new PagedResult<OrdenDTO>
            {
                Items = dtos,
                TotalRecords = totalRecords,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            });
        }
    }
}
