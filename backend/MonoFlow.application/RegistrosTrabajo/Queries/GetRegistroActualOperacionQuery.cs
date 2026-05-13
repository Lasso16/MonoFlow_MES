using System;
using MonoFlow.application.RegistrosTrabajo.DTOs;
using MonoFlow.domain.Aggregates.Result;
using MediatR;

namespace MonoFlow.application.RegistrosTrabajo.Queries
{
    public record GetRegistroActualOperacionQuery(Guid OperacionId) : IRequest<Result<RegistroActualOperacionDTO>>;
}