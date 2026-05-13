using MonoFlow.application.Articulos.Commands;
using MonoFlow.application.Articulos.DTOs;
using MonoFlow.application.Articulos.Queries;
using MonoFlow.application.Common;
using MonoFlow.application.Ordenes.Commands;
using MonoFlow.application.Ordenes.DTOs;
using MonoFlow.application.Ordenes.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MonoFlow.domain.Aggregates.Result;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MonoFlow.api.Controllers
{
    [ApiController]
    [Route("ordenes")]
    public class OrdenController : ControllerBase
    {
        private readonly IMediator _mediator;

        public OrdenController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOrdenCommand command)
        {
            command.Id = id;
            var result = await _mediator.Send(command);
            return result.Success ? Ok(new { Message = result.Message }) : (result.Message.Contains("no existe") ? NotFound(new { message = result.Message }) : BadRequest(new { message = result.Message }));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteOrdenCommand(id));
            return result.Success ? NoContent() : (result.Message.Contains("no existe") ? NotFound(new { message = result.Message }) : BadRequest(new { message = result.Message }));
        }

        [HttpPost("{id}/finalizar")]
        public async Task<IActionResult> Finalizar(Guid id)
        {
            var result = await _mediator.Send(new FinalizarOrdenCommand(id));
            return result.Success ? Ok(new { Message = result.Message }) : (result.Message.Contains("no existe") ? NotFound(new { message = result.Message }) : BadRequest(new { message = result.Message }));
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<OrdenDTO>>> GetAll([FromQuery] GetAllOrdenesQuery query)
        {
            return Ok(await _mediator.Send(query));
        }

        [HttpGet("estado-planta")]
        public async Task<IActionResult> GetEstadoPlanta()
        {
            var result = await _mediator.Send(new GetEstadoPlantaQuery());
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrdenDTO>> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetOrdenByIdQuery(id));
            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }

            return result.FailureStatus == FailureStatus.NotFound
                ? NotFound(new { message = result.Error })
                : BadRequest(new { message = result.Error });
        } 

        [HttpGet("{id}/articulos")]
        public async Task<ActionResult<List<ArticuloDTO>>> GetArticulos(Guid id)
        {
            var result = await _mediator.Send(new GetArticulosByOrdenIdQuery(id));
            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }

            return result.FailureStatus == FailureStatus.NotFound
                ? NotFound(new { message = result.Error })
                : BadRequest(new { message = result.Error });
        }

        [HttpPost("{id}/articulos")]
        public async Task<IActionResult> AddArticulo(Guid id, [FromBody] AddArticuloCommand command)
        {
            command.OrdenId = id;
            var result = await _mediator.Send(command);
            if (result.Success)
            {
                return Ok(new { Id = result.Data });
            }

            if (result.Message.Contains("No se encontró"))
            {
                return NotFound(new { message = result.Message });
            }

            if (result.Message.Contains("Ya existe", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { message = result.Message });
            }

            return BadRequest(new { message = result.Message });
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrden([FromBody] CreateOrdenCommand command)
        {
            var result = await _mediator.Send(command);
            return result.Success ? Ok(new { Id = result.Data }) : BadRequest(new { message = result.Message });
        }

    }
}
