using MonoFlow.application.Operaciones.DTOs;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using System;
using System.Collections.Generic;

namespace MonoFlow.application.Operaciones.Queries
{
    public record GetOperacionesByArticuloIdQuery(Guid ArticuloId) : IRequest<Result<List<OperacionDTO>>>;
}
