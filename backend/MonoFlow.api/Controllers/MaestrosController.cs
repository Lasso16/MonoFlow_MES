using MonoFlow.domain.Aggregates.Articulos;
using MonoFlow.domain.Aggregates.Eventos;
using MonoFlow.domain.Aggregates.Incidencias;
using MonoFlow.domain.Aggregates.Operaciones;
using MonoFlow.domain.Aggregates.Operarios;
using MonoFlow.domain.Aggregates.Ordenes;
using MonoFlow.domain.Aggregates.Producciones;
using MonoFlow.domain.Aggregates.ProduccionesRechazadas;
using MonoFlow.domain.Aggregates.RegistrosTrabajo;
using MonoFlow.domain.Aggregates.SesionesOperarios;
using MonoFlow.domain.Aggregates.TiposEvento;
using MonoFlow.domain.Aggregates.TiposIncidencia;
using MonoFlow.domain.Aggregates.TiposOperacion;
using MonoFlow.domain.Aggregates.TiposRechazo;
using MonoFlow.application.Operaciones.Queries;
using MonoFlow.application.Operarios.Queries;
using MonoFlow.application.RegistrosTrabajo.Queries;

using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace MonoFlow.api.Controllers
{
    [ApiController]
    [Route("/maestros")]
    public class MaestrosController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MaestrosController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("rechazos")]
        public async Task<IActionResult> GetAllTiposRechazo()
        {
            try
            {
                var tipos = await _mediator.Send(new GetAllTipoRechazoQuery());
                return Ok(tipos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        
        [HttpGet("incidencias")]
        public async Task<IActionResult> GetAllTiposIncidencia()
        {
            try
            {
                var tipos = await _mediator.Send(new GetAllTipoIncidenciaQuery());
                return Ok(tipos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpGet("eventos")]
        public async Task<IActionResult> GetAllTiposEvento()
        {
            try
            {
                var tipos = await _mediator.Send(new GetAllTipoEventoQuery());
                return Ok(tipos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpGet("operaciones")]
        public async Task<IActionResult> GetAllTiposOperacion()
        {
            try
            {
                var tipos = await _mediator.Send(new GetAllTipoOperacionQuery());
                return Ok(tipos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }
}

