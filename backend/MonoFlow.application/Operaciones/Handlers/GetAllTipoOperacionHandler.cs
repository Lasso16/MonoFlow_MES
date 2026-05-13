using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.Operaciones.DTOs;
using MonoFlow.application.Operaciones.Queries;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operaciones.Handlers
{
    public class GetAllTipoOperacionHandler : IRequestHandler<GetAllTipoOperacionQuery, List<TipoOperacionDTO>>
    {
        private readonly IAppDbContext _context;

        public GetAllTipoOperacionHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<List<TipoOperacionDTO>> Handle(GetAllTipoOperacionQuery request, CancellationToken cancellationToken)
        {
            return await _context.TiposOperacionRead
                .AsNoTracking()
                .Select(t => new TipoOperacionDTO
                {
                    Id = t.Id,
                    Tipo = t.Tipo
                })
                .ToListAsync(cancellationToken);
        }
    }
}
