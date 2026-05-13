using MonoFlow.application.Common.Interfaces;
using MonoFlow.domain.Aggregates.TiposIncidencia;
using MonoFlow.application.RegistrosTrabajo.Queries;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.RegistrosTrabajo.Handlers
{
    public class GetAllTipoIncidenciaHandler : IRequestHandler<GetAllTipoIncidenciaQuery, List<TipoIncidencia>>
    {
        private readonly IAppDbContext _context;

        public GetAllTipoIncidenciaHandler(IAppDbContext context)
        {
            _context = context;
        }
        public async Task<List<TipoIncidencia>> Handle(GetAllTipoIncidenciaQuery request, CancellationToken cancellationToken)
        {
            return await _context.TiposIncidenciaRead
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }
    }
}



