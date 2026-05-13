using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.Operarios.DTOs;
using MonoFlow.application.Operarios.Queries;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operarios.Handlers
{
    public class GetOperarioByIdHandler : IRequestHandler<GetOperarioByIdQuery, Result<OperarioDTO>>
    {
        private readonly IAppDbContext _context;

        public GetOperarioByIdHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<OperarioDTO>> Handle(GetOperarioByIdQuery request, CancellationToken cancellationToken)
        {
            var dto = await _context.OperariosRead
                .AsNoTracking()
                .Where(o => o.Id == request.Id)
                .Select(o => new OperarioDTO
                {
                    Id = o.Id,
                    Nombre = o.Nombre,
                    NumeroOperario = o.NumeroOperario,
                    Activo = o.Activo,
                    Rol = o.Rol.ToString()
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (dto == null)
            {
                return Result.NotFoundFailure<OperarioDTO>("Operario no encontrado.");
            }

            return Result.Success(dto);
        }
    }
}


