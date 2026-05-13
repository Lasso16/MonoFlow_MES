using MonoFlow.application.Articulos.DTOs;
using MonoFlow.application.Articulos.Queries;
using MonoFlow.application.Common.Interfaces;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Articulos.Handlers
{
    public class GetArticulosByOrdenIdHandler : IRequestHandler<GetArticulosByOrdenIdQuery, Result<List<ArticuloDTO>>>
    {
        private readonly IAppDbContext _context;

        public GetArticulosByOrdenIdHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<ArticuloDTO>>> Handle(GetArticulosByOrdenIdQuery request, CancellationToken cancellationToken)
        {
            var ordenExists = await _context.OrdenesRead
                .AsNoTracking()
                .AnyAsync(o => o.Id == request.OrdenId, cancellationToken);
            
            if (!ordenExists) return Result.NotFoundFailure<List<ArticuloDTO>>("Orden no encontrada.");

            var articulos = await _context.ArticulosRead
                .AsNoTracking()
                .Where(a => a.IdOrden == request.OrdenId)
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
                .ToListAsync(cancellationToken);

            return Result.Success(articulos);
        }
    }
}

