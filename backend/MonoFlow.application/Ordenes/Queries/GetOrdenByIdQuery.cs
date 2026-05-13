using MediatR;
using MonoFlow.application.Ordenes.DTOs;
using MonoFlow.domain.Aggregates.Result;
using System;
using System.Collections.Generic;
using System.Text;

namespace MonoFlow.application.Ordenes.Queries
{
    public record GetOrdenByIdQuery(Guid Id) : IRequest<Result<OrdenDTO>>;

}
