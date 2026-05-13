using MonoFlow.application.Common;
using MonoFlow.application.Ordenes.DTOs;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using System.Collections.Generic;

namespace MonoFlow.application.Ordenes.Queries
{
    public record GetAllOrdenesQuery(
        EstadoOrden? Estado,
        string? IdNavision,
        string? Cliente,
        int PageNumber = 1,
        int PageSize = 20
    ) : IRequest<Result<PagedResult<OrdenDTO>>>;
}
