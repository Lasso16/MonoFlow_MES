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
using MonoFlow.domain.Aggregates.Common;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

using MonoFlow.application.Articulos.DTOs;

namespace MonoFlow.application.Ordenes.DTOs
{
    public class OrdenDTO
    {
        public Guid Id { get; set; }
        public string IdNavision { get; set; } = null!;
        public string Estado { get; set; } = null!;
        public string Descripcion { get; set; } = null!;
        public string? Cliente { get; set; }
        public string? CodigoProcedencia { get; set; }
        public int Progreso { get; set; }

        [JsonIgnore]
        public List<ArticuloDTO> Articulos { get; set; } = new();
    }
}

