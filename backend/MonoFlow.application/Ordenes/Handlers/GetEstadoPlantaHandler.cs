using MonoFlow.application.Common.Interfaces;
using MonoFlow.application.Ordenes.DTOs;
using MonoFlow.application.Ordenes.Queries;
using MonoFlow.domain.Aggregates.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace MonoFlow.application.Ordenes.Handlers
{
    public class GetEstadoPlantaHandler : IRequestHandler<GetEstadoPlantaQuery, List<EstadoPlantaOrdenDTO>>
    {
        private readonly IAppDbContext _dbContext;

        public GetEstadoPlantaHandler(IAppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<EstadoPlantaOrdenDTO>> Handle(GetEstadoPlantaQuery request, CancellationToken cancellationToken)
        {
            var ordenes = await _dbContext.Ordenes
                .AsNoTracking()
                .Include(o => o.Articulos)
                    .ThenInclude(a => a.Operaciones)
                        .ThenInclude(op => op.TipoOperacion)
                .Include(o => o.Articulos)
                    .ThenInclude(a => a.Operaciones)
                        .ThenInclude(op => op.Registros)
                            .ThenInclude(r => r.Sesiones)
                                .ThenInclude(s => s.Operario)
                .Where(o => o.Estado == EstadoOrden.ENCURSO)
                .ToListAsync(cancellationToken);

            var resultado = new List<EstadoPlantaOrdenDTO>();

            foreach (var orden in ordenes)
            {
                var articulosActivos = new List<EstadoPlantaArticuloDTO>();

                foreach (var articulo in orden.Articulos)
                {
                    if (articulo.CalcularEstado() != EstadoArticulo.ENCURSO)
                    {
                        continue;
                    }

                    var operacionesActivas = new List<EstadoPlantaOperacionDTO>();

                    foreach (var operacion in articulo.Operaciones.Where(o =>
                        o.Estado.HasValue &&
                        o.Estado.Value != EstadoOperacion.Pendiente &&
                        o.Estado.Value != EstadoOperacion.FinProduccion))
                    {
                        var registrosActivos = new List<EstadoPlantaRegistroDTO>();

                        foreach (var registro in operacion.Registros.Where(r => !r.Finalizado))
                        {
                            var operariosActivos = registro.Sesiones
                                .Where(s => !s.Fin.HasValue && s.Operario != null && s.Operario.Activo)
                                .Select(s => new EstadoPlantaOperarioDTO
                                {
                                    IdOperario = s.IdOperario,
                                    NumeroOperario = s.Operario.NumeroOperario,
                                    Nombre = s.Operario.Nombre,
                                    Rol = s.Operario.Rol.ToString(),
                                    InicioSesion = s.Inicio
                                })
                                .ToList();

                            registrosActivos.Add(new EstadoPlantaRegistroDTO
                            {
                                IdRegistro = registro.Id,
                                Inicio = registro.Inicio,
                                TotalProducidoOk = registro.TotalProducidoOk,
                                TotalRechazado = registro.TotalRechazado,
                                Operarios = operariosActivos
                            });
                        }

                        operacionesActivas.Add(new EstadoPlantaOperacionDTO
                        {
                            IdOperacion = operacion.Id,
                            TipoOperacion = operacion.TipoOperacion?.Tipo ?? string.Empty,
                            CantidadTotal = operacion.CantidadTotal,
                            Estado = operacion.Estado?.ToString() ?? string.Empty,
                            Registros = registrosActivos
                        });
                    }

                    articulosActivos.Add(new EstadoPlantaArticuloDTO
                    {
                        IdArticulo = articulo.Id,
                        Referencia = articulo.Referencia,
                        Cantidad = articulo.Cantidad,
                        Descripcion = articulo.Descripcion,
                        InicioPlan = articulo.InicioPlan,
                        FinPlan = articulo.FinPlan,
                        Estado = articulo.CalcularEstado().ToString(),
                        Progreso = articulo.CalcularPorcentajeCompletado(),
                        Operaciones = operacionesActivas
                    });
                }

                if (!articulosActivos.Any())
                {
                    continue;
                }

                resultado.Add(new EstadoPlantaOrdenDTO
                {
                    IdOrden = orden.Id,
                    IdNavision = orden.IdNavision,
                    Cliente = orden.Cliente,
                    Descripcion = orden.Descripcion,
                    Estado = orden.Estado.ToString(),
                    Progreso = orden.CalcularProgreso(),
                    Articulos = articulosActivos
                });
            }

            return resultado;
        }
    }
}