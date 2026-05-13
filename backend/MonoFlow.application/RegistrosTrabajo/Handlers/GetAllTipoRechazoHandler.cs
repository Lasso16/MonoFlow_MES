using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.RegistrosTrabajo.Queries;
using MonoFlow.domain.Aggregates.TiposRechazo;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.RegistrosTrabajo.Handlers
{
    public class GetAllTipoRechazoHandler : IRequestHandler<GetAllTipoRechazoQuery, List<TipoRechazo>>
    {
        private readonly IAppDbContext _context;

        public GetAllTipoRechazoHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<List<TipoRechazo>> Handle(GetAllTipoRechazoQuery request, CancellationToken cancellationToken)
        {
            return await _context.TiposRechazoRead
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }
    }
}



