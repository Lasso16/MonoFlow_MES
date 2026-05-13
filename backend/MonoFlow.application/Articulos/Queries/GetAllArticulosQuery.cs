using MonoFlow.application.Articulos.DTOs;
using MonoFlow.application.Common;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using System;
using System.Collections.Generic;

namespace MonoFlow.application.Articulos.Queries
{
    //Estados: 0 pendiente, 1 activo, 2 finalizado
        public record GetAllArticulosQuery(
        string? Referencia,
        string? Descripcion,
        Guid? OrdenId,
        EstadoArticulo? Estado,
        bool? SoloPendientes,
        int PageNumber = 1,
        int PageSize = 10
    ) : IRequest<Result<PagedResult<ArticuloDTO>>>;
}
