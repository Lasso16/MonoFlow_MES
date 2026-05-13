using MonoFlow.application.Common;
using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.Operarios.DTOs;
using MonoFlow.application.Operarios.Queries;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operarios.Handlers
{
    public class GetAllOperariosHandler : IRequestHandler<GetAllOperariosQuery, Result<List<OperarioDTO>>>
    {
        private readonly IAppDbContext _context;

        public GetAllOperariosHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<OperarioDTO>>> Handle(GetAllOperariosQuery request, CancellationToken cancellationToken)
        {
            var query = _context.OperariosRead
                .AsNoTracking()
                .Where(o =>
                    (string.IsNullOrEmpty(request.Nombre) || o.Nombre.Contains(request.Nombre)) &&
                    (!request.NumeroOperario.HasValue || o.NumeroOperario == request.NumeroOperario.Value) &&
                    (!request.Activo.HasValue || o.Activo == request.Activo.Value));

            var dtos = await query
                .Select(o => new OperarioDTO
                {
                    Id = o.Id,
                    Nombre = o.Nombre,
                    NumeroOperario = o.NumeroOperario,
                    Activo = o.Activo,
                    Rol = o.Rol.ToString()
                })
                .ToListAsync(cancellationToken);

            return Result.Success(dtos);
        }
    }
}

