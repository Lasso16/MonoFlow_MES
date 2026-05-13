using MonoFlow.application.Common;
using MonoFlow.application.Operaciones.DTOs;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using System.Collections.Generic;

namespace MonoFlow.application.Operaciones.Queries
{
    // 1: pendiente , 2: en proceso, 3: finalizado
    public record GetAllOperacionesQuery(
        EstadoOperacion? Estado,
        Guid? ArticuloId,
        int? TipoOperacionId,
        DateTime? FechaInicio,
        DateTime? FechaFin,
        int PageNumber = 1,
        int PageSize = 10
    ) : IRequest<Result<PagedResult<OperacionDTO>>>;
}
