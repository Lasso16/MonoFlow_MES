using MonoFlow.application.Operaciones.DTOs;
using MediatR;
using System.Collections.Generic;

namespace MonoFlow.application.Operaciones.Queries
{
    public class GetAllTipoOperacionQuery : IRequest<List<TipoOperacionDTO>>
    {
    }
}
