using MonoFlow.application.Operaciones.DTOs;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using System;
using System.Collections.Generic;

namespace MonoFlow.application.Operaciones.Queries
{
	public record GetRegistrosByOperacionIdQuery(Guid OperacionId) : IRequest<Result<List<RegistroTrabajoDTO>>>;
}
