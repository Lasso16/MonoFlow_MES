import type {
  EventoResponse,
  IncidenciaResponse,
  RegistroActualOperacionResponse,
} from '../../../../model/aggregates/RegistroTrabajo';

export type TerminalHistoryTableProps = {
  operacionId?: string;
  registroActualOperacion?: RegistroActualOperacionResponse;
  isRegistroActualOperacionLoading?: boolean;
  isRegistroActualOperacionError?: boolean;
};

export type EventoLike = EventoResponse & {
  idEvento?: string;
  idTipoEvento?: number | string;
  nombreTipoEvento?: string;
  inicio?: string;
  IdEvento?: string;
  IdTipoEvento?: number | string;
  NombreTipoEvento?: string;
  Inicio?: string;
};

export type IncidenciaLike = IncidenciaResponse & {
  idEvento?: string;
  IdEvento?: string;
  eventoId?: string;
  EventoId?: string;
  nombreTipoIncidencia?: string;
  comentario?: string | null;
  NombreTipoIncidencia?: string;
  Comentario?: string | null;
};

export type EventColorKey =
  | 'pendiente'
  | 'enpreparacion'
  | 'enejecucion'
  | 'enrecogida'
  | 'finproduccion'
  | 'incidentado'
  | 'pausado'
  | 'detenido'
  | 'desconocido';

export type EventoTableRow = {
  id: string;
  tipoEvento: string;
  inicio?: string;
  inicioMs?: number;
  fin?: string;
  finMs?: number;
  color: EventColorKey;
  isIncidencia: boolean;
  sortTime: number;
  duracionMs?: number;
};