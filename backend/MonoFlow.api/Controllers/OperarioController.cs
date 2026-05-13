using MonoFlow.application.Common;
using MonoFlow.application.Operarios.Commands;
using MonoFlow.application.Operarios.DTOs;
using MonoFlow.application.Operarios.Queries;
using MonoFlow.application.RegistrosTrabajo.Commands;
using MonoFlow.application.RegistrosTrabajo.Queries;
using MonoFlow.domain.Aggregates.Operarios;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MonoFlow.api.Controllers
{
    [ApiController]
    [Route("operarios")]
    public class OperarioController : ControllerBase
    {
        private readonly IMediator _mediator;

        public OperarioController(IMediator mediator)
        {
            _mediator = mediator;
        }


        [HttpGet]
        public async Task<ActionResult<List<OperarioDTO>>> GetAll([FromQuery] GetAllOperariosQuery query)
        {
            return Ok(await _mediator.Send(query));
        }


        [HttpGet("{id:guid}")]
        public async Task<ActionResult<OperarioDTO>> GetById(Guid id)
        {
            var operario = await _mediator.Send(new GetOperarioByIdQuery(id));

            if (operario == null)
            {
                return NotFound(new { Message = $"Operario con ID {id} no encontrado." });
            }

            return Ok(operario);
        }

        [HttpGet("{id:guid}/registro-activo")]
        public async Task<IActionResult> GetRegistroActivo(Guid id)
        {
            var operario = await _mediator.Send(new GetOperarioByIdQuery(id));

            if (operario == null)
            {
                return NotFound(new { Message = $"Operario con ID {id} no encontrado." });
            }

            var registroActivo = await _mediator.Send(new GetRegistroActivoOperarioQuery(id));

            if (registroActivo == null)
            {
                return NotFound(new { Message = "El operario no tiene ningun registro de trabajo activo." });
            }

            return Ok(registroActivo);
        }

        [HttpGet("numero/{numero:int}")]
        public async Task<ActionResult<OperarioDTO>> GetByNumero(int numero)
        {
            var operario = await _mediator.Send(new GetOperarioByNumeroQuery(numero));

            if (operario == null)
            {
                return NotFound(new { Message = $"No existe operario con el número {numero}." });
            }

            return Ok(operario);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOperarioDataCommand command)
        {
            command.Id = id;

            var result = await _mediator.Send(command);

            return result.Success ? Ok(result.Data) : (result.Message.Contains("No se encontró") ? NotFound(new { message = result.Message }) : BadRequest(new { message = result.Message }));
        }

        [HttpPut("{id:guid}/desactivar")]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            var result = await _mediator.Send(new DeactivateOperarioCommand(id));

            if (!result.Success) return result.Message.Contains("No se encontró") ? NotFound(new { message = result.Message }) : BadRequest(new { message = result.Message });

            return NoContent();
        }

        [HttpPut("{id:guid}/cerrar-sesion")]
        public async Task<IActionResult> CerrarSesion(Guid id)
        {
            try
            {
                var result = await _mediator.Send(new CerrarSesionOperarioCommand
                {
                    OperarioId = id
                });

                return result.Success ? Ok(new { Message = result.Message }) : BadRequest(new { Message = result.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<Operario>> Create(CreateOperarioCommand command)
        {
            var result = await _mediator.Send(command);
            
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result.Data);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteOperarioCommand(id));

            if (!result.Success)
                return result.Message.Contains("No se encontró") ? NotFound(new { message = result.Message }) : BadRequest(new { Message = result.Message });

            return Ok(new { Message = result.Message });
        }
    }
}
