using MonoFlow.application.Articulos.DTOs;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using System;

namespace MonoFlow.application.Articulos.Queries
{
    public record GetArticuloByIdQuery(Guid Id) : IRequest<Result<ArticuloDTO>>;
}
