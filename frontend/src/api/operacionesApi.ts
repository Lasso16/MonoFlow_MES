import { Result } from "../model/Result";
import { type PagedResult } from "../model/PagedResult";
import {
  type OperacionProgresoResponse,
  type OperacionRegistroResponse,
  type OperacionResponse,
  type OperacionResumenResponse,
  type UpdateOperacionPayload,
} from "../model/aggregates/Operaciones";
import { API_URL, deleteAggregateItem, getAggregateItem, getAggregateList, putAggregateItem, handleResponse, fetchData, normalizePagedResult } from "./apiClient";
import type { ApiPagedResponse } from "./apiClient";

const urlOperaciones = `${API_URL}/operaciones`;

export const buildPaginationQuery = (pageNumber = 1, pageSize = 20): string => {
  const params = new URLSearchParams();
  params.set("pageNumber", String(pageNumber));
  params.set("pageSize", String(pageSize));
  return `?${params.toString()}`;
};

export const GET_operaciones = async (
  pageNumber = 1,
  pageSize = 20,
): Promise<Result<PagedResult<OperacionResponse>>> => {
  const response = await fetchData(`${urlOperaciones}${buildPaginationQuery(pageNumber, pageSize)}`, "GET");
  const result = await handleResponse<ApiPagedResponse<OperacionResponse>>(response);

  if (result.isFailure) {
    return Result.failure<PagedResult<OperacionResponse>>(result.error ?? "No se pudo obtener la lista de operaciones.");
  }

  return Result.success(normalizePagedResult(result.value));
};

export const GET_operacionById = async (id: string): Promise<Result<OperacionResponse>> => {
  return await getAggregateItem<OperacionResponse>(urlOperaciones, id);
};

export const GET_operacionProgreso = async (id: string): Promise<Result<OperacionProgresoResponse>> => {
  return await getAggregateList<OperacionProgresoResponse>(`${urlOperaciones}/${id}/progreso`);
};

export const GET_operacionRegistros = async (id: string): Promise<Result<OperacionRegistroResponse[]>> => {
  return await getAggregateList<OperacionRegistroResponse[]>(`${urlOperaciones}/${id}/registros`);
};

export const GET_operacionResumen = async (id: string): Promise<Result<OperacionResumenResponse>> => {
  return await getAggregateList<OperacionResumenResponse>(`${urlOperaciones}/${id}/resumen`);
};

export const PUT_operacion = async (id: string, payload: UpdateOperacionPayload): Promise<Result<OperacionResponse>> => {
  return await putAggregateItem<OperacionResponse>(urlOperaciones, id, JSON.stringify(payload));
};

export const DELETE_operacion = async (id: string): Promise<Result<void>> => {
  return await deleteAggregateItem(urlOperaciones, id);
};
