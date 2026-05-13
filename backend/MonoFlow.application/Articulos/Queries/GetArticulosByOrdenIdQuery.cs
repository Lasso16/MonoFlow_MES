using MonoFlow.application.Articulos.DTOs;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using System;
using System.Collections.Generic;

namespace MonoFlow.application.Articulos.Queries
{
    public record GetArticulosByOrdenIdQuery(Guid OrdenId) : IRequest<Result<List<ArticuloDTO>>>;
}
