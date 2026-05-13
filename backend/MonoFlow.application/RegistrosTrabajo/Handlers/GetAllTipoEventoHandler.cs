using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.RegistrosTrabajo.Queries;
using MonoFlow.domain.Aggregates.TiposEvento;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.RegistrosTrabajo.Handlers
{
    public class GetAllTipoEventoHandler : IRequestHandler<GetAllTipoEventoQuery, List<TipoEvento>>
    {
        private readonly IAppDbContext _context;

        public GetAllTipoEventoHandler(IAppDbContext context)
        {
            _context = context;
        }
        public async Task<List<TipoEvento>> Handle(GetAllTipoEventoQuery request, CancellationToken cancellationToken)
        {
            return await _context.TiposEventoRead
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }
    }
}


