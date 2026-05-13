using MonoFlow.application.RegistrosTrabajo.DTOs;
using MediatR;
using System;

namespace MonoFlow.application.RegistrosTrabajo.Queries
{
    public record GetRegistroActivoOperarioQuery(Guid OperarioId) : IRequest<RegistroActivoOperarioDTO?>;
}