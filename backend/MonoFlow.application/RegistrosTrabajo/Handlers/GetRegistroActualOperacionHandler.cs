using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.Operarios.DTOs;
using MonoFlow.application.RegistrosTrabajo.DTOs;
using MonoFlow.application.RegistrosTrabajo.Queries;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace MonoFlow.application.RegistrosTrabajo.Handlers
{
    public class GetRegistroActualOperacionHandler : IRequestHandler<GetRegistroActualOperacionQuery, Result<RegistroActualOperacionDTO>>
    {
        private readonly IAppDbContext _context;

        public GetRegistroActualOperacionHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<RegistroActualOperacionDTO>> Handle(GetRegistroActualOperacionQuery request, CancellationToken cancellationToken)
        {
            var registro = await _context.RegistrosTrabajoRead
                .AsNoTracking()
                .Where(r => r.IdOperacion == request.OperacionId && !r.Finalizado)
                .OrderByDescending(r => r.Inicio)
                .Select(r => new
                {
                    r.Id,
                    r.IdOperacion,
                    r.Inicio,
                    r.Fin,
                    r.Finalizado,
                    r.Observaciones,
                    TotalProducidoOk = (int)r.TotalProducidoOk,
                    TotalRechazado = (int)r.TotalRechazado
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (registro == null)
            {
                return Result.NotFoundFailure<RegistroActualOperacionDTO>("No existe un registro de trabajo activo para la operacion indicada.");
            }

            var sesionesDTO = await _context.SesionesOperarioRead
                .AsNoTracking()
                .Where(s => s.IdRegistro == registro.Id && !s.Fin.HasValue)
                .Join(
                    _context.OperariosRead.AsNoTracking(),
                    sesion => sesion.IdOperario,
                    operario => operario.Id,
                    (sesion, operario) => new SesionDTO
                    {
                        Id = sesion.Id,
                        Inicio = sesion.Inicio,
                        Fin = sesion.Fin,
                        Operario = new OperarioDTO 
                        {
                            Id = operario.Id,
                            NumeroOperario = operario.NumeroOperario,
                            Nombre = operario.Nombre,
                            Activo = operario.Activo,
                            Rol = operario.Rol.ToString()
                        }
                    })
                .ToListAsync(cancellationToken);

            var producciones = await _context.ProduccionesRead
                .AsNoTracking()
                .Where(p => p.IdRegistro == registro.Id)
                .OrderBy(p => p.Timestamp)
                .Select(p => new ProduccionDTO
                {
                    IdRegistro = p.IdRegistro,
                    Cantidad = (int)p.CantidadOk,
                    TotalProducidoOk = registro.TotalProducidoOk,
                    TotalRechazado = registro.TotalRechazado,
                    Timestamp = p.Timestamp,
                    IdOperario = null
                })
                .ToListAsync(cancellationToken);

            var rechazos = await (from rechazo in _context.RechazosRead.AsNoTracking()
                                  join tipo in _context.TiposRechazoRead.AsNoTracking() on rechazo.IdTipoRechazo equals tipo.Id into tipoJoin
                                  from tipo in tipoJoin.DefaultIfEmpty()
                                  where rechazo.IdRegistro == registro.Id
                                  orderby rechazo.Timestamp
                                  select new RechazoDTO
                                  {
                                      IdRegistro = rechazo.IdRegistro,
                                      IdTipoRechazo = rechazo.IdTipoRechazo,
                                      NombreTipoRechazo = tipo != null ? tipo.Motivo : string.Empty,
                                      Cantidad = (int)rechazo.CantidadRechazo,
                                      TotalProducidoOk = registro.TotalProducidoOk,
                                      TotalRechazado = registro.TotalRechazado,
                                      Comentario = rechazo.Comentario,
                                      Timestamp = rechazo.Timestamp,
                                      IdOperario = null
                                  })
                .ToListAsync(cancellationToken);

            var eventos = await (from evento in _context.EventosRead.AsNoTracking()
                                 join tipo in _context.TiposEventoRead.AsNoTracking() on evento.IdTipoEvento equals tipo.Id into tipoJoin
                                 from tipo in tipoJoin.DefaultIfEmpty()
                                 where evento.IdRegistro == registro.Id
                                 orderby evento.Inicio
                                 select new EventoDTO
                                 {
                                     IdEvento = evento.Id,
                                     IdTipoEvento = evento.IdTipoEvento,
                                     NombreTipoEvento = tipo != null ? tipo.Tipo : string.Empty,
                                     Inicio = evento.Inicio,
                                     Fin = evento.Fin,
                                     IdOperario = null,
                                     Incidencias = new List<IncidenciaDTO>()
                                 })
                .ToListAsync(cancellationToken);

            var incidenciasPorEvento = await (from incidencia in _context.IncidenciasRead.AsNoTracking()
                                              join evento in _context.EventosRead.AsNoTracking() on incidencia.IdEvento equals evento.Id
                                              join tipo in _context.TiposIncidenciaRead.AsNoTracking() on incidencia.IdTipoIncidencia equals tipo.Id into tipoJoin
                                              from tipo in tipoJoin.DefaultIfEmpty()
                                              where evento.IdRegistro == registro.Id
                                              orderby evento.Inicio
                                              select new
                                              {
                                                  incidencia.IdEvento,
                                                  Incidencia = new IncidenciaDTO
                                                  {
                                                      GuidIncidencia = incidencia.Id,
                                                      IdTipoIncidencia = incidencia.IdTipoIncidencia,
                                                      NombreTipoIncidencia = tipo != null ? tipo.Tipo : string.Empty,
                                                      Comentario = incidencia.Comentario,
                                                      IdOperario = null
                                                  }
                                              })
                .ToListAsync(cancellationToken);

            var incidenciasLookup = incidenciasPorEvento
                .GroupBy(x => x.IdEvento)
                .ToDictionary(g => g.Key, g => g.Select(x => x.Incidencia).ToList());

            foreach (var evento in eventos)
            {
                if (incidenciasLookup.TryGetValue(evento.IdEvento, out var incidenciasEvento))
                {
                    evento.Incidencias = incidenciasEvento;
                }
            }

            var response = new RegistroActualOperacionDTO
            {
                IdRegistro = registro.Id,
                IdOperacion = registro.IdOperacion,
                Inicio = registro.Inicio,
                Fin = registro.Fin,
                Finalizado = registro.Finalizado,
                Observaciones = registro.Observaciones,
                TotalProducidoOk = registro.TotalProducidoOk,
                TotalRechazado = registro.TotalRechazado,
                SesionesActivas = sesionesDTO,
                Producciones = producciones,
                Rechazos = rechazos,
                Eventos = eventos
            };

            return Result.Success(response);
        }
    }
}