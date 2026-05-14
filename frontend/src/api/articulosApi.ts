import { Result } from "../model/Result";
import { type PagedResult } from "../model/PagedResult";
import { type ArticuloResponse, type UpdateArticuloPayload } from "../model/aggregates/Articulos";
import { type CreateOperacionPayload, type OperacionResponse } from "../model/aggregates/Operaciones";
import { API_URL, deleteAggregateItem, getAggregateItem, getAggregateList, postAggregateItem, putAggregateItem, handleResponse, fetchData } from "./apiClient";

const urlArticulos = `${API_URL}/articulos`;

type ArticulosFilters = {
  soloPendientes?: boolean;
  estado?: string;
  referencia?: string;
  descripcion?: string;
};

export const buildArticulosQuery = (pageNumber = 1, pageSize = 20, filters?: ArticulosFilters): string => {
  const params = new URLSearchParams();
  params.set("pageNumber", String(pageNumber));
  params.set("pageSize", String(pageSize));

  if (typeof filters?.soloPendientes === "boolean") {
    params.set("soloPendientes", String(filters.soloPendientes));
  }

  if (filters?.estado && filters.estado.trim() !== "") {
    params.set("estado", filters.estado.trim());
  }

  if (filters?.referencia && filters.referencia.trim() !== "") {
    params.set("referencia", filters.referencia.trim());
  }

  if (filters?.descripcion && filters.descripcion.trim() !== "") {
    params.set("descripcion", filters.descripcion.trim());
  }

  return `?${params.toString()}`;
};

export const GET_articulos = async (
  pageNumber = 1,
  pageSize = 20,
  filters?: ArticulosFilters,
): Promise<Result<PagedResult<ArticuloResponse>>> => {
  const response = await fetchData(`${urlArticulos}${buildArticulosQuery(pageNumber, pageSize, filters)}`, "GET");
  const result = await handleResponse<PagedResult<ArticuloResponse>>(response);

  if (result.isFailure) {
    return Result.failure<PagedResult<ArticuloResponse>>(result.error ?? "No se pudo obtener la lista de articulos.");
  }

  return result;
};

export const GET_articuloById = async (id: string): Promise<Result<ArticuloResponse>> => {
  return await getAggregateItem<ArticuloResponse>(urlArticulos, id);
};

export const GET_operacionesArticulo = async (id: string): Promise<Result<OperacionResponse[]>> => {
  return await getAggregateList<OperacionResponse[]>(`${urlArticulos}/${id}/operaciones`);
};

export const POST_operacionArticulo = async (id: string, payload: CreateOperacionPayload): Promise<Result<OperacionResponse>> => {
  return await postAggregateItem<OperacionResponse>(`${urlArticulos}/${id}/operaciones`, JSON.stringify(payload));
};

export const PUT_articulo = async (id: string, payload: UpdateArticuloPayload): Promise<Result<ArticuloResponse>> => {
  return await putAggregateItem<ArticuloResponse>(urlArticulos, id, JSON.stringify(payload));
};

export const DELETE_articulo = async (id: string): Promise<Result<void>> => {
  return await deleteAggregateItem(urlArticulos, id);
};
