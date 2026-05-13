using MonoFlow.application.Articulos.Commands;
using MonoFlow.application.Articulos.DTOs;
using MonoFlow.application.Articulos.Queries;
using MonoFlow.application.Common;
using MonoFlow.application.Operaciones.Commands;
using MonoFlow.application.Operaciones.DTOs;
using MonoFlow.application.Operaciones.Queries;
using MonoFlow.domain.Aggregates.Common;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MonoFlow.api.Controllers
{
    [ApiController]
    [Route("articulos")]
    public class ArticuloController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ArticuloController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<ArticuloDTO>>> GetAll([FromQuery] GetAllArticulosQuery query)
        {
            var result = await _mediator.Send(query);
            return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ArticuloDTO>> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetArticuloByIdQuery(id));
            if (!result.IsSuccess) return NotFound(result.Error);
            return Ok(result.Value);
        }

        [HttpGet("{id}/operaciones")]
        public async Task<ActionResult<List<OperacionDTO>>> GetOperaciones(Guid id)
        {
            var result = await _mediator.Send(new GetOperacionesByArticuloIdQuery(id));
            if (result.IsSuccess)
                return Ok(result.Value);

            return result.FailureStatus == FailureStatus.NotFound
                ? NotFound(new { message = result.Error })
                : BadRequest(new { message = result.Error });
        }

        [HttpPost("{id}/operaciones")]
        public async Task<IActionResult> AddOperacion(Guid id, [FromBody] AddOperacionCommand command)
        {
            command.ArticuloId = id;
            var result = await _mediator.Send(command);
            return result.Success ? Ok(new { Id = result.Data }) : (result.Message.Contains("no existe") ? NotFound(new { message = result.Message }) : BadRequest(new { message = result.Message }));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateArticuloCommand command)
        {
            command.Id = id;
            var result = await _mediator.Send(command);
            return result.Success ? Ok(new { Message = result.Message }) : (result.Message.Contains("no existe") ? NotFound(new { message = result.Message }) : BadRequest(new { message = result.Message }));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteArticuloCommand(id));
            if (!result.Success)
            {
                return BadRequest(new { Message = result.Message });
            }
            return NoContent();
        }
    }
}
