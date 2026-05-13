using MonoFlow.application.RegistrosTrabajo.Commands;
using MonoFlow.application.RegistrosTrabajo.DTOs;
using MonoFlow.application.RegistrosTrabajo.Queries;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace MonoFlow.api.Controllers
{
    [ApiController]
    [Route("operaciones/{operacionId:guid}/registro-trabajo")]
    public class OperacionRegistroController : ControllerBase
    {
        private readonly IMediator _mediator;

        public OperacionRegistroController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<RegistroActualOperacionDTO>> GetRegistroActual([FromRoute] Guid operacionId)
        {
            var result = await _mediator.Send(new GetRegistroActualOperacionQuery(operacionId));

            if (result.IsFailure)
            {
                return result.FailureStatus == FailureStatus.NotFound
                    ? NotFound(new { message = result.Error })
                    : BadRequest(new { message = result.Error });
            }

            return Ok(result.Value);
        }

        [HttpPost("abrir")]
        public async Task<IActionResult> Abrir([FromRoute] Guid operacionId, [FromBody] AbrirRegistroTrabajoCommand command)
        {
            command.OperacionId = operacionId;
            try
            {
                var result = await _mediator.Send(command);
                if (result.Success)
                {
                    return Ok(new
                    {
                        Message = result.Message,
                        Registro = result.Data
                    });
                }

                return BadRequest(new { Message = result.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        //Finaliza el registro de trabajo y cierra todas las sesiones abiertas relacionadas. 
        [HttpPut("finalizar")]
        public async Task<IActionResult> FinalizarRegistro([FromRoute] Guid operacionId, [FromBody] FinalizarRegistroTrabajoCommand command)
        {
            command.OperacionId = operacionId;
            try
            {
                var success = await _mediator.Send(command);
                return success
                    ? Ok(new { Message = "Registro de trabajo finalizado y todas las sesiones cerradas." })
                    : BadRequest(new { Message = "Hubo un error al guardar." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPost("observaciones")]
        public async Task<IActionResult> AddObservacionPost([FromRoute] Guid operacionId, [FromBody] AddObservacionRegistroTrabajoCommand command)
        {
            return await AddObservacionInternal(operacionId, command);
        }

        [HttpPut("observaciones")]
        public async Task<IActionResult> AddObservacionPut([FromRoute] Guid operacionId, [FromBody] AddObservacionRegistroTrabajoCommand command)
        {
            return await AddObservacionInternal(operacionId, command);
        }

        [HttpPost("produccion")]
        public async Task<IActionResult> RegistrarProduccion([FromRoute] Guid operacionId, [FromBody] RegistrarProduccionCommand command)
        {
            command.idOperacion = operacionId;
            try
            {
                var result = await _mediator.Send(command);
                return result != null ? Ok(result)
                    : BadRequest(new { Message = "Hubo un error al guardar el registro de producción." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPost("rechazo")]
        public async Task<IActionResult> RegistrarRechazo([FromRoute] Guid operacionId, [FromBody] RegistrarRechazoCommand command)
        {
            command.idOperacion = operacionId;
            try
            {
                var result = await _mediator.Send(command);
                return result != null ? Ok(result)
                    : BadRequest(new { Message = "Hubo un error al guardar el registro de rechazo." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPost("evento")]
        public async Task<IActionResult> RegistrarEvento([FromRoute] Guid operacionId, [FromBody] RegistrarEventoCommand command)
        {
            command.OperacionId = operacionId;
            try
            {
                var result = await _mediator.Send(command);

                if (result != null)
                {
                    return Ok(new
                    {
                        Message = "Cambio de estado registrado correctamente.",
                        Evento = result 
                    });
                }

                return BadRequest(new { Message = "No se pudo registrar el evento." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPost("incidencia")]
        public async Task<IActionResult> RegistrarIncidencia([FromRoute] Guid operacionId, [FromBody] RegistrarIncidenciaCommand command)
        {
            command.OperacionId = operacionId;
            try
            {
                var result = await _mediator.Send(command);
                return result != null ? Ok(result) : BadRequest();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        private async Task<IActionResult> AddObservacionInternal(Guid operacionId, AddObservacionRegistroTrabajoCommand command)
        {
            command.OperacionId = operacionId;

            try
            {
                var observaciones = await _mediator.Send(command);
                return Ok(new
                {
                    Message = "Observacion agregada correctamente.",
                    Observaciones = observaciones
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }
}
