using MonoFlow.application.Articulos.DTOs;
using MonoFlow.application.Articulos.Queries;
using MonoFlow.application.Common.Interfaces;
using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Articulos.Handlers
{
    public class GetArticuloByIdHandler : IRequestHandler<GetArticuloByIdQuery, Result<ArticuloDTO>>
    {
        private readonly IAppDbContext _context;

        public GetArticuloByIdHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<ArticuloDTO>> Handle(GetArticuloByIdQuery request, CancellationToken cancellationToken)
        {
            var result = await _context.ArticulosRead
                .AsNoTracking()
                .Where(a => a.Id == request.Id)
                .Select(a => new ArticuloDTO
                {
                    Id = a.Id,
                    IdOrden = a.IdOrden,
                    Referencia = a.Referencia,
                    Linea = a.Linea,
                    Cantidad = a.Cantidad,
                    Descripcion = a.Descripcion,
                    InicioPlan = a.InicioPlan,
                    FinPlan = a.FinPlan,
                    CantidadOperaciones = a.Operaciones.Count(),
                    Estado = (!a.Operaciones.Any() || a.Operaciones.All(o => o.Estado == EstadoOperacion.Pendiente))
                        ? EstadoArticulo.PENDIENTE
                        : (a.Operaciones.All(o => o.Estado == EstadoOperacion.FinProduccion)
                            ? EstadoArticulo.FINALIZADO
                            : EstadoArticulo.ENCURSO),
                    Progreso = a.Operaciones.Any()
                        ? (int)((double)a.Operaciones.Count(o => o.Estado == EstadoOperacion.FinProduccion) / a.Operaciones.Count() * 100)
                        : 0
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (result == null)
            {
                return Result.NotFoundFailure<ArticuloDTO>("Artículo no encontrado");
            }

            return Result.Success(result);
        }
    }
}
