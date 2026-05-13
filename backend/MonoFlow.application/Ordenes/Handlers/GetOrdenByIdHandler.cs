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
    public class GetOrdenByIdHandler : IRequestHandler<GetOrdenByIdQuery, Result<OrdenDTO>>
    {
        private readonly IAppDbContext _context;

        public GetOrdenByIdHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<OrdenDTO>> Handle(GetOrdenByIdQuery request, CancellationToken cancellationToken)
        {
            var dto = await _context.OrdenesRead
                .AsNoTracking()
                .Where(o => o.Id == request.Id)
                .Select(o => new OrdenDTO
                {
                    Id = o.Id,
                    IdNavision = o.IdNavision,
                    Estado = o.Estado.ToString(),
                    Descripcion = o.Descripcion,
                    Cliente = o.Cliente,
                    Progreso = o.Articulos.Any()
                        ? (int)o.Articulos.Average(a =>
                            a.Operaciones.Any()
                                ? (double)a.Operaciones.Count(op => op.Estado == EstadoOperacion.FinProduccion) / a.Operaciones.Count() * 100
                                : 0)
                        : 0
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (dto == null)
            {
                return Result.NotFoundFailure<OrdenDTO>("Orden no encontrada.");
            }

            return Result.Success(dto);
        }
    }
}
