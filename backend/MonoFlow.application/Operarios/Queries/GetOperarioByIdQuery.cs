using MonoFlow.application.Operarios.DTOs;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using System;

namespace MonoFlow.application.Operarios.Queries
{
    public class GetOperarioByIdQuery : IRequest<Result<OperarioDTO>>
    {
        public Guid Id { get; }

        public GetOperarioByIdQuery(Guid id)
        {
            Id = id;
        }
    }
}
