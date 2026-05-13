import { type AggregateModel } from "../AggregateModel";

export interface OperacionResponse extends AggregateModel {
  idArticulo: string;
  idTipoOperacion: number;
  tipoOperacion: string;
  cantidadTotal: number;
  cantidadProducida: number;
  cantidadRechazada: number;
  cantidadComponentes?: number;
  tiempoPlan?: number;
  tiempoTotal: number;
  estado?: number | string;
  inicio?: string;
  fin?: string;
  ultimaOperacion: boolean;
  progreso: number;
}

export interface CreateOperacionPayload {
  idTipoOperacion: number;
  cantidadComponentes?: number;
  tiempoPlan?: number;
  ultimaOperacion?: boolean;
}

export interface UpdateOperacionPayload {
  cantidadComponentes?: number;
  tiempoPlan?: number;
}

export interface OperacionProgresoResponse {
  operacionId: string;
  porcentaje: number;
  completadas: number;
  pendientes: number;
  total: number;
}

export interface OperacionRegistroResponse {
  id: string;
  operacionId: string;
  fecha: string;
  descripcion: string;
  usuario?: string;
}

export interface DetalleSesionDTO {
  nombreOperario: string;
  numeroOperario?: number;
  rol: string;
  inicio: string;
  fin?: string;
}

export interface DetalleProduccionDTO {
  cantidadOk: number;
  timestamp: string;
}

export interface ResumenIncidenciaDTO {
  tipoIncidencia: string;
  comentario: string;
  inicio: string;
  fin?: string;
  duracionMinutos: number;
}

export interface ResumenRechazoDTO {
  tipo: string;
  cantidad: number;
  comentario: string;
  timestamp: string;
}

export interface DetalleRegistroDTO {
  registroId: string;
  inicio: string;
  fin?: string;
  finalizado: boolean;
  observaciones?: string;
  operarios: DetalleSesionDTO[];
  producciones: DetalleProduccionDTO[];
  incidencias: ResumenIncidenciaDTO[];
  rechazos: ResumenRechazoDTO[];
}

export interface OperacionResumenResponse {
  operacionId: string;
  cliente: string;
  descripcionArticulo: string;
  cantidadTotal: number;
  unidadesFabricadas: number;
  tipoOperacion: string;
  tiempoPlanificado?: number;
  tiempoTotal: number;
  inicio?: string;
  fin?: string;
  tiempoTrabajo: number;
  tiempoEfectivo: number;
  tiempoPausa: number;
  tiempoIncidencia: number;
  tiempoPreparacion: number;
  tiempoRecogida: number;
  detalleRegistros: DetalleRegistroDTO[];
}

