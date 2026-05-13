import type { Operario } from './Operarios';

export interface RegistroTrabajoResponse {
  idRegistro: string;
  idOperacion: string;
  inicio: string;
  operarios: string[];
}

export interface ProduccionDTO {
  idRegistro: string;
  cantidad: number;
  totalProducidoOk: number;
  totalRechazado: number;
  timestamp: string;
  idOperario?: string | null;
  IdOperario?: string | null;
}

export interface RechazoDTO {
  idRegistro: string;
  idTipoRechazo: number;
  nombreTipoRechazo: string;
  cantidad: number;
  totalProducidoOk: number;
  totalRechazado: number;
  comentario?: string | null;
  timestamp: string;
  idOperario?: string | null;
  IdOperario?: string | null;
}

export interface EventoDTO {
  idEvento: string;
  idTipoEvento: number;
  nombreTipoEvento: string;
  inicio: string;
  fin?: string | null;
  idOperario?: string | null;
  IdOperario?: string | null;
}

export interface IncidenciaDTO {
  guidIncidencia: string;
  idTipoIncidencia: number;
  nombreTipoIncidencia: string;
  comentario?: string | null;
  idOperario?: string | null;
  IdOperario?: string | null;
}

// NUEVO: Añadimos SesionDTO para que coincida con tu clase C#
export interface SesionDTO {
  id: string;
  nombre?: string;
  numeroOperario?: number | string;
  inicio: string;
  fin?: string | null;
  operario: Operario;
}

export type SesionOperarioDTO = SesionDTO;

export type ProduccionResponse = ProduccionDTO;
export type RechazoResponse = RechazoDTO;
export type IncidenciaResponse = IncidenciaDTO;
export type EventoResponse = EventoDTO;

export interface RegistroActivoOperarioResponse {
  idRegistro: string;
  idOperacion: string;
  inicioRegistro: string;
  inicioSesionOperario: string;
}

export interface RegistroActualOperacionDTO {
  idRegistro: string;
  idOperacion: string;
  inicio: string;
  fin?: string | null;
  finalizado: boolean;
  observaciones?: string | null;
  totalProducidoOk: number;
  totalRechazado: number;
  // ACTUALIZADO: Referenciamos al nuevo SesionDTO
  sesionesActivas: SesionDTO[];
  SesionesActivas?: SesionDTO[];
  operarios?: Operario[];
  producciones: ProduccionDTO[];
  rechazos: RechazoDTO[];
  eventos: EventoDTO[];
  incidencias: IncidenciaDTO[];
}

export type RegistroActualOperacionResponse = RegistroActualOperacionDTO;

export interface AbrirRegistroTrabajoPayload {
  idOperarios: string[];
}

export interface AbrirRegistroTrabajoResponse {
  message: string;
  registro: RegistroTrabajoResponse;
}

export interface FinalizarRegistroTrabajoResponse {
  message: string;
}

export interface ObservacionRegistroTrabajoPayload {
  observacion: string;
}

export interface ObservacionRegistroTrabajoResponse {
  message: string;
  observaciones: string;
}

export interface RegistrarProduccionPayload {
  cantidad: number;
}

export interface RegistrarRechazoPayload {
  cantidad: number;
  idTipoRechazo: number;
  comentario?: string | null;
}

export interface RegistrarEventoPayload {
  idTipoEvento: number;
}

export interface RegistrarEventoResponse {
  message: string;
  evento: EventoResponse;
}

export interface RegistrarIncidenciaPayload {
  idTipoIncidencia: number;
  comentario?: string | null;
}

export interface CerrarSesionOperarioResponse {
  message: string;
}

export type ObservacionMethod = "POST" | "PUT";