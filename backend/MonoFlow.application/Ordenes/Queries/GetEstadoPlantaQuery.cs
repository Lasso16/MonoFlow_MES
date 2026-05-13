using MonoFlow.application.Ordenes.DTOs;
using MediatR;
using System.Collections.Generic;

namespace MonoFlow.application.Ordenes.Queries
{
	public record GetEstadoPlantaQuery() : IRequest<List<EstadoPlantaOrdenDTO>>;
}
