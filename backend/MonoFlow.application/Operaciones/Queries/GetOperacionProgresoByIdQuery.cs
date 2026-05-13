using MonoFlow.application.Operaciones.DTOs;
using MediatR;
using System;

namespace MonoFlow.application.Operaciones.Queries
{
    public record GetOperacionProgresoByIdQuery(Guid Id) : IRequest<OperacionProgresoDTO?>;
}
