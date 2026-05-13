using MonoFlow.domain.Aggregates.Result;
using MonoFlow.application.Operaciones.DTOs;
using MediatR;
using System;

namespace MonoFlow.application.Operaciones.Queries
{
    public record GetResumenOperacionQuery(Guid OperacionId) : IRequest<Result<ResumenOperacionDTO>>;
}
