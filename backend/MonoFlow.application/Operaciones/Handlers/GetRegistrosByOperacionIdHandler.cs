using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.Operaciones.DTOs;
using MonoFlow.application.Operaciones.Queries;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MonoFlow.application.Operaciones.Handlers
{
    public class GetRegistrosByOperacionIdHandler : IRequestHandler<GetRegistrosByOperacionIdQuery, Result<List<RegistroTrabajoDTO>>>
    {
        private readonly IAppDbContext _context;

        public GetRegistrosByOperacionIdHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<RegistroTrabajoDTO>>> Handle(GetRegistrosByOperacionIdQuery request, CancellationToken cancellationToken)
        {
            var registros = await _context.RegistrosTrabajoRead
                .AsNoTracking()
                .Where(r => r.IdOperacion == request.OperacionId)
                .Select(r => new RegistroTrabajoDTO
                {
                    Id = r.Id,
                    IdOperacion = r.IdOperacion,
                    Inicio = r.Inicio,
                    Fin = r.Fin,
                    Finalizado = r.Finalizado,
                    Observaciones = r.Observaciones,
                    TotalProducidoOk = 0,
                    TotalRechazado = 0
                })
                .ToListAsync(cancellationToken);

            if (registros.Count == 0)
            {
                return Result.Success(registros);
            }

            var registroIds = registros.Select(r => r.Id).ToList();

            var produccionPorRegistro = await _context.ProduccionesRead
                .AsNoTracking()
                .Where(p => registroIds.Contains(p.IdRegistro))
                .GroupBy(p => p.IdRegistro)
                .Select(g => new
                {
                    IdRegistro = g.Key,
                    TotalProducidoOk = g.Sum(p => (int?)p.CantidadOk) ?? 0
                })
                .ToDictionaryAsync(x => x.IdRegistro, x => x.TotalProducidoOk, cancellationToken);

            var rechazoPorRegistro = await _context.RechazosRead
                .AsNoTracking()
                .Where(r => registroIds.Contains(r.IdRegistro))
                .GroupBy(r => r.IdRegistro)
                .Select(g => new
                {
                    IdRegistro = g.Key,
                    TotalRechazado = g.Sum(r => (int?)r.CantidadRechazo) ?? 0
                })
                .ToDictionaryAsync(x => x.IdRegistro, x => x.TotalRechazado, cancellationToken);

            foreach (var registro in registros)
            {
                if (produccionPorRegistro.TryGetValue(registro.Id, out var totalOk))
                {
                    registro.TotalProducidoOk = totalOk;
                }

                if (rechazoPorRegistro.TryGetValue(registro.Id, out var totalRechazado))
                {
                    registro.TotalRechazado = totalRechazado;
                }
            }

            return Result.Success(registros);
        }
    }
}
