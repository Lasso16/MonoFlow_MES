using MonoFlow.application.Common;
using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.Operaciones.DTOs;
using MonoFlow.application.Operaciones.Queries;
using MonoFlow.domain.Aggregates.TiposEvento;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Operaciones.Handlers
{
    public class GetResumenOperacionHandler : IRequestHandler<GetResumenOperacionQuery, Result<ResumenOperacionDTO>>
    {
        private readonly IAppDbContext _context;

        public GetResumenOperacionHandler(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<ResumenOperacionDTO>> Handle(GetResumenOperacionQuery request, CancellationToken cancellationToken)
        {
            var operacion = await _context.Operaciones
                .AsNoTracking()
                .Include(o => o.TipoOperacion)
                .FirstOrDefaultAsync(o => o.Id == request.OperacionId, cancellationToken);

            if (operacion == null)
            {
                return Result.NotFoundFailure<ResumenOperacionDTO>("Operación no encontrada.");
            }

            var registros = await _context.RegistrosTrabajo
                .AsNoTracking()
                .Where(r => r.IdOperacion == request.OperacionId)
                .OrderBy(r => r.Inicio)
                .ToListAsync(cancellationToken);

            var registroIds = registros.Select(r => r.Id).ToList();

            var eventos = await _context.Eventos
                .AsNoTracking()
                .Where(e => registroIds.Contains(e.IdRegistro))
                .Include(e => e.Incidencias)
                    .ThenInclude(i => i.TipoIncidencia)
                .ToListAsync(cancellationToken);

            var rechazos = await _context.Rechazos
                .AsNoTracking()
                .Where(r => registroIds.Contains(r.IdRegistro))
                .Include(r => r.TipoRechazo)
                .ToListAsync(cancellationToken);

            var sesiones = await _context.SesionesOperario
                .AsNoTracking()
                .Where(s => registroIds.Contains(s.IdRegistro))
                .Include(s => s.Operario)
                .ToListAsync(cancellationToken);

            var producciones = await _context.Producciones
                .AsNoTracking()
                .Where(p => registroIds.Contains(p.IdRegistro))
                .ToListAsync(cancellationToken);

            var eventosPorRegistro = eventos
                .GroupBy(e => e.IdRegistro)
                .ToDictionary(g => g.Key, g => g.ToList());

            var rechazosPorRegistro = rechazos
                .GroupBy(r => r.IdRegistro)
                .ToDictionary(g => g.Key, g => g.ToList());

            var sesionesPorRegistro = sesiones
                .GroupBy(s => s.IdRegistro)
                .ToDictionary(g => g.Key, g => g.ToList());

            var produccionesPorRegistro = producciones
                .GroupBy(p => p.IdRegistro)
                .ToDictionary(g => g.Key, g => g.ToList());

            var articuloConOrden = await _context.Articulos
                .AsNoTracking()
                .Join(
                    _context.Ordenes.AsNoTracking(),
                    articulo => articulo.IdOrden,
                    orden => orden.Id,
                    (articulo, orden) => new
                    {
                        articulo.Id,
                        articulo.Descripcion,
                        Cliente = orden.Cliente
                    })
                .FirstOrDefaultAsync(a => a.Id == operacion.IdArticulo, cancellationToken);

            var dto = new ResumenOperacionDTO
            {
                OperacionId = operacion.Id,
                Cliente = articuloConOrden?.Cliente ?? string.Empty,
                DescripcionArticulo = articuloConOrden?.Descripcion ?? string.Empty,
                CantidadTotal = (int)operacion.CantidadTotal,
                UnidadesFabricadas = registros.Sum(r => (int)r.TotalProducidoOk),
                TipoOperacion = operacion.TipoOperacion?.Tipo ?? string.Empty,
                TiempoPlanificado = operacion.TiempoPlan,
                TiempoTotal = 0,
                Inicio = operacion.Inicio,
                Fin = operacion.Fin
            };

            var now = DateTime.Now;

            foreach (var registro in registros)
            {
                if (!sesionesPorRegistro.TryGetValue(registro.Id, out var sesionesRegistro))
                {
                    sesionesRegistro = new List<domain.Aggregates.SesionesOperarios.SesionOperario>();
                }

                if (!produccionesPorRegistro.TryGetValue(registro.Id, out var produccionesRegistro))
                {
                    produccionesRegistro = new List<domain.Aggregates.Producciones.Produccion>();
                }

                if (!eventosPorRegistro.TryGetValue(registro.Id, out var eventosRegistro))
                {
                    eventosRegistro = new List<domain.Aggregates.Eventos.Evento>();
                }

                if (!rechazosPorRegistro.TryGetValue(registro.Id, out var rechazosRegistro))
                {
                    rechazosRegistro = new List<domain.Aggregates.ProduccionesRechazadas.Rechazo>();
                }

                

                var detalleRegistro = new DetalleRegistroDTO
                {
                    RegistroId = registro.Id,
                    Inicio = registro.Inicio,
                    Fin = registro.Fin,
                    Finalizado = registro.Finalizado,
                    Observaciones = registro.Observaciones,
                    Operarios = sesionesRegistro
                        .OrderBy(s => s.Inicio)
                        .Select(s => new DetalleSesionDTO
                        {
                            NombreOperario = s.Operario?.Nombre ?? string.Empty,
                            NumeroOperario = s.Operario?.NumeroOperario ?? 0,
                            Rol = s.Operario?.Rol.ToString() ?? string.Empty,
                            Inicio = s.Inicio,
                            Fin = s.Fin
                        })
                        .ToList(),
                    Producciones = produccionesRegistro
                        .OrderBy(p => p.Timestamp)
                        .Select(p => new DetalleProduccionDTO
                        {
                            CantidadOk = (int)p.CantidadOk,
                            Timestamp = p.Timestamp
                        })
                        .ToList(),
                    Rechazos = rechazosRegistro
                        .OrderBy(r => r.Timestamp)
                        .Select(r => new ResumenRechazoDTO
                        {
                            Tipo = r.TipoRechazo?.Motivo ?? string.Empty,
                            Cantidad = (int)r.CantidadRechazo,
                            Comentario = r.Comentario ?? string.Empty,
                            Timestamp = r.Timestamp
                        })
                        .ToList()
                };

                foreach (var evento in eventosRegistro)
                {
                    var fin = evento.Fin ?? now;
                    var duracion = (fin - evento.Inicio).TotalMinutes;

                    switch (evento.IdTipoEvento)
                    {
                        case TiposEventoEstandar.Preparacion:
                            dto.TiempoPreparacion += duracion;
                            break;
                        case TiposEventoEstandar.Ejecucion:
                            dto.TiempoEfectivo += duracion;
                            break;
                        case TiposEventoEstandar.Pausa:
                            dto.TiempoPausa += duracion;
                            break;
                        case TiposEventoEstandar.Incidencia:
                            dto.TiempoIncidencia += duracion;
                            foreach (var inc in evento.Incidencias)
                            {
                                detalleRegistro.Incidencias.Add(new ResumenIncidenciaDTO
                                {
                                    TipoIncidencia = inc.TipoIncidencia?.Tipo ?? string.Empty,
                                    Comentario = inc.Comentario,
                                    Inicio = evento.Inicio,
                                    Fin = evento.Fin,
                                    DuracionMinutos = duracion
                                });
                            }
                            break;
                        case TiposEventoEstandar.Recogida:
                            dto.TiempoRecogida += duracion;
                            break;
                    }
                }

                dto.DetalleRegistros.Add(detalleRegistro);
            }

            dto.TiempoTotal = dto.TiempoPreparacion
                + dto.TiempoEfectivo
                + dto.TiempoPausa
                + dto.TiempoIncidencia
                + dto.TiempoRecogida;

            dto.TiempoTrabajo = dto.TiempoEfectivo;

            return Result.Success(dto);
        }
    }
}
