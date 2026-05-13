import { type Result } from "../model/Result";
import {
  type AbrirRegistroTrabajoPayload,
  type AbrirRegistroTrabajoResponse,
  type FinalizarRegistroTrabajoResponse,
  type IncidenciaResponse,
  type ObservacionMethod,
  type ObservacionRegistroTrabajoPayload,
  type ObservacionRegistroTrabajoResponse,
  type ProduccionResponse,
  type RegistrarEventoPayload,
  type RegistrarEventoResponse,
  type RegistrarIncidenciaPayload,
  type RegistrarProduccionPayload,
  type RegistrarRechazoPayload,
  type RechazoResponse,
  type RegistroActualOperacionDTO,
} from "../model/aggregates/RegistroTrabajo";
import { API_URL, getAggregateList, postAggregateItem, putAggregateItem } from "./apiClient";

const urlOperaciones = `${API_URL}/operaciones`;

export const getUrlRegistroTrabajo = (operacionId: string): string => {
  return `${urlOperaciones}/${operacionId}/registro-trabajo`;
};

export const GET_registroActualOperacion = async (operacionId: string): Promise<Result<RegistroActualOperacionDTO>> => {
  return await getAggregateList<RegistroActualOperacionDTO>(`${urlOperaciones}/${operacionId}/registro-trabajo`);
};

export const POST_abrirRegistroTrabajo = async (
  operacionId: string,
  payload: AbrirRegistroTrabajoPayload,
): Promise<Result<AbrirRegistroTrabajoResponse>> => {
  return await postAggregateItem<AbrirRegistroTrabajoResponse>(`${getUrlRegistroTrabajo(operacionId)}/abrir`, JSON.stringify(payload));
};

export const PUT_finalizarRegistroTrabajo = async (operacionId: string): Promise<Result<FinalizarRegistroTrabajoResponse>> => {
  return await putAggregateItem<FinalizarRegistroTrabajoResponse>(`${getUrlRegistroTrabajo(operacionId)}/finalizar`, "", JSON.stringify({}));
};

export const MUTATE_observacionRegistroTrabajo = async (
  operacionId: string,
  payload: ObservacionRegistroTrabajoPayload,
  method: ObservacionMethod,
): Promise<Result<ObservacionRegistroTrabajoResponse>> => {
  const url = `${getUrlRegistroTrabajo(operacionId)}/observaciones`;
  const body = JSON.stringify(payload);

  if (method === "POST") {
    return await postAggregateItem<ObservacionRegistroTrabajoResponse>(url, body);
  }

  return await putAggregateItem<ObservacionRegistroTrabajoResponse>(url, "", body);
};

export const POST_registrarProduccion = async (
  operacionId: string,
  payload: RegistrarProduccionPayload,
): Promise<Result<ProduccionResponse>> => {
  return await postAggregateItem<ProduccionResponse>(`${getUrlRegistroTrabajo(operacionId)}/produccion`, JSON.stringify(payload));
};

export const POST_registrarRechazo = async (
  operacionId: string,
  payload: RegistrarRechazoPayload,
): Promise<Result<RechazoResponse>> => {
  return await postAggregateItem<RechazoResponse>(`${getUrlRegistroTrabajo(operacionId)}/rechazo`, JSON.stringify(payload));
};

export const POST_registrarEvento = async (
  operacionId: string,
  payload: RegistrarEventoPayload,
): Promise<Result<RegistrarEventoResponse>> => {
  return await postAggregateItem<RegistrarEventoResponse>(`${getUrlRegistroTrabajo(operacionId)}/evento`, JSON.stringify(payload));
};

export const POST_registrarIncidencia = async (
  operacionId: string,
  payload: RegistrarIncidenciaPayload,
): Promise<Result<IncidenciaResponse>> => {
  return await postAggregateItem<IncidenciaResponse>(`${getUrlRegistroTrabajo(operacionId)}/incidencia`, JSON.stringify(payload));
};
