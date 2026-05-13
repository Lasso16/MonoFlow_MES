using MonoFlow.application.Operaciones.DTOs;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using System;

namespace MonoFlow.application.Operaciones.Queries
{
    public record GetOperacionByIdQuery(Guid Id) : IRequest<Result<OperacionDTO>>;
}
