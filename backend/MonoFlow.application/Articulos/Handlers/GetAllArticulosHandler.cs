using MonoFlow.application.Articulos.DTOs;
using MonoFlow.application.Articulos.Queries;
using MonoFlow.application.Common;
using MonoFlow.application.Common.Interfaces;
using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Articulos.Handlers
{
    public class GetAllArticulosHandler : IRequestHandler<GetAllArticulosQuery, Result<PagedResult<ArticuloDTO>>>
    {
        private readonly IAppDbContext _context;

        public GetAllArticulosHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult<ArticuloDTO>>> Handle(GetAllArticulosQuery request, CancellationToken ct)
        {
            var query = _context.ArticulosRead
                .AsNoTracking()
                .Where(a =>
                    (string.IsNullOrEmpty(request.Referencia) || a.Referencia.Contains(request.Referencia)) &&
                    (string.IsNullOrEmpty(request.Descripcion) || (a.Descripcion != null && a.Descripcion.Contains(request.Descripcion))) &&
                    (!request.OrdenId.HasValue || a.IdOrden == request.OrdenId.Value) &&
                    (request.SoloPendientes != true || a.Operaciones.Any()))
                .Select(a => new ArticuloDTO
                {
                    Id = a.Id,
                    IdOrden = a.IdOrden,
                    Referencia = a.Referencia,
                    Descripcion = a.Descripcion,
                    Cantidad = a.Cantidad,
                    CantidadOperaciones = a.Operaciones.Count(),
                    Estado = (!a.Operaciones.Any() || a.Operaciones.All(o => o.Estado == EstadoOperacion.Pendiente))
                        ? EstadoArticulo.PENDIENTE
                        : (a.Operaciones.All(o => o.Estado == EstadoOperacion.FinProduccion)
                            ? EstadoArticulo.FINALIZADO
                            : EstadoArticulo.ENCURSO),
                    Progreso = a.Operaciones.Any()
                        ? (int)((double)a.Operaciones.Count(o => o.Estado == EstadoOperacion.FinProduccion) / a.Operaciones.Count() * 100)
                        : 0
                });

            if (request.Estado.HasValue)
            {
                query = query.Where(dto => dto.Estado == request.Estado.Value);
            }

            if (request.SoloPendientes == true)
            {
                query = query.Where(dto => dto.Estado != EstadoArticulo.FINALIZADO);
            }

            var total = await query.CountAsync(ct);

            var dtos = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(ct);

            return Result.Success(new PagedResult<ArticuloDTO>
            {
                Items = dtos,
                TotalRecords = total,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            });
        }
    }
}
