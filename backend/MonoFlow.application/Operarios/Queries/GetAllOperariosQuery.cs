using MonoFlow.application.Common;
using MonoFlow.application.Operarios.DTOs;
using MonoFlow.domain.Aggregates.Operarios;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using System.Collections.Generic;

namespace MonoFlow.application.Operarios.Queries
{
    public record GetAllOperariosQuery(
        string? Nombre,
        int? NumeroOperario,
        bool? Activo
    ) : IRequest<Result<List<OperarioDTO>>>;
}

