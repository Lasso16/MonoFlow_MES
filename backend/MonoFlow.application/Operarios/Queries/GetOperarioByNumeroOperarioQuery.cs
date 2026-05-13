using MonoFlow.application.Operarios.DTOs;
using MonoFlow.domain.Aggregates.Result;
using MediatR;

namespace MonoFlow.application.Operarios.Queries
{
    public class GetOperarioByNumeroQuery : IRequest<Result<OperarioDTO>>
    {
        public int NumeroOperario { get; }

        public GetOperarioByNumeroQuery(int numeroOperario)
        {
            NumeroOperario = numeroOperario;
        }
    }
}

