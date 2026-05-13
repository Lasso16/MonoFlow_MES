using MonoFlow.application.Common;
using MonoFlow.application.Operaciones.Commands;
using MonoFlow.application.Operaciones.DTOs;
using MonoFlow.application.Operaciones.Queries;
using MonoFlow.domain.Aggregates.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace MonoFlow.api.Controllers
{
    [ApiController]
    [Route("operaciones")]
    public class OperacionController : ControllerBase
    {
        private readonly IMediator _mediator;

        public OperacionController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<OperacionDTO>>> GetAll([FromQuery] GetAllOperacionesQuery query)
        {
            return Ok(await _mediator.Send(query));
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<OperacionDTO>> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetOperacionByIdQuery(id));
            if (result.IsFailure)
            {
                return result.FailureStatus == FailureStatus.NotFound
                    ? NotFound(new { message = result.Error })
                    : BadRequest(new { message = result.Error });
            }

            return Ok(result.Value);
        }

        [HttpGet("{id:guid}/progreso")]
        public async Task<ActionResult<OperacionProgresoDTO>> GetProgreso(Guid id)
        {
            var result = await _mediator.Send(new GetOperacionProgresoByIdQuery(id));
            return result != null ? Ok(result) : NotFound();
        }

        [HttpGet("{id:guid}/registros")]
        public async Task<IActionResult> GetRegistros(Guid id)
        {
            var result = await _mediator.Send(new GetRegistrosByOperacionIdQuery(id));
            return Ok(result);
        }

        [HttpGet("{id:guid}/resumen")]
        public async Task<IActionResult> GetResumen(Guid id)
        {
            var result = await _mediator.Send(new GetResumenOperacionQuery(id));
            if (result.IsFailure)
            {
                return result.FailureStatus == FailureStatus.NotFound
                    ? NotFound(new { result.Error })
                    : BadRequest(new { result.Error });
            }
            return Ok(result.Value);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOperacionCommand command)
        {
            command.Id = id;
            var result = await _mediator.Send(command);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            var result = await _mediator.Send(new DeleteOperacionCommand(id));
            if (!result.Success)
            {
                return BadRequest(new { Message = result.Message });
            }
            return NoContent();
        }
    }
}
