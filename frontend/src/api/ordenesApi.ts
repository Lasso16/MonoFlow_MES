import { Result } from "../model/Result";
import { type PagedResult } from "../model/PagedResult";
import {
  type ArticuloOrden,
  type CreateArticuloOrden,
  type CreateArticuloPayload,
  type CreateOrdenPayload,
  type Orden,
  type OrdenFilters,
  type UpdateOrden,
} from "../model/aggregates/Ordenes";
import { API_URL, deleteAggregateItem, getAggregateItem, getAggregateList, normalizePagedResult, postAggregate, postAggregateItem, putAggregateItem } from "./apiClient";

const urlOrdenes = `${API_URL}/ordenes`;

export const buildOrdenesQuery = (pageNumber = 1, pageSize = 20, filters?: OrdenFilters): string => {
  const params = new URLSearchParams();
  const normalizedPageNumber = Math.max(1, Number(pageNumber) || 1);
  const normalizedPageSize = Math.max(1, Number(pageSize) || 20);

  params.set("PageNumber", String(normalizedPageNumber));
  params.set("PageSize", String(normalizedPageSize));

  if (filters?.estado) {
    const estados = Array.isArray(filters.estado)
      ? filters.estado
      : [filters.estado];

    estados
      .map((estado) => estado.trim())
      .filter((estado) => estado !== "")
      .forEach((estado) => params.append("Estado", estado));
  }

  if (filters?.idNavision && filters.idNavision.trim() !== "") {
    params.set("IdNavision", filters.idNavision.trim());
  }

  if (filters?.cliente && filters.cliente.trim() !== "") {
    params.set("Cliente", filters.cliente.trim());
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const POST_orden = async (payload: CreateOrdenPayload): Promise<Result<Orden>> => {
  return await postAggregate<Orden>(urlOrdenes, payload);
};

export const PUT_orden = async (id: string, payload: UpdateOrden): Promise<Result<Orden>> => {
  return await putAggregateItem<Orden>(urlOrdenes, id, JSON.stringify(payload));
};

export const DELETE_orden = async (id: string): Promise<Result<void>> => {
  return await deleteAggregateItem(urlOrdenes, id);
};

export const GET_ordenById = async (id: string): Promise<Result<Orden>> => {
  return await getAggregateItem<Orden>(urlOrdenes, id);
};

export const GET_ordenes = async (
  pageNumber = 1,
  pageSize = 20,
  filters?: OrdenFilters,
): Promise<Result<PagedResult<Orden>>> => {
  const result = await getAggregateList<any>(
    `${urlOrdenes}${buildOrdenesQuery(pageNumber, pageSize, filters)}`,
  );

  if (result.isFailure) {
    return Result.failure<PagedResult<Orden>>(result.error ?? "Error al obtener órdenes.");
  }

  return Result.success(normalizePagedResult<Orden>(result.value));
};

export const GET_estadoPlanta = async (): Promise<Result<unknown>> => {
  return await getAggregateList<unknown>(`${urlOrdenes}/estado-planta`);
};

export const GET_articulosOrden = async (id: string): Promise<Result<ArticuloOrden[]>> => {
  return await getAggregateList<ArticuloOrden[]>(`${urlOrdenes}/${id}/articulos`);
};

export const POST_articuloOrden = async (id: string, payload: CreateArticuloOrden): Promise<Result<ArticuloOrden>> => {
  return await postAggregateItem<ArticuloOrden>(`${urlOrdenes}/${id}/articulos`, JSON.stringify(payload));
};

export const POST_ordenArticulo = async (idOrden: string, payload: CreateArticuloPayload): Promise<Result<ArticuloOrden>> => {
  return await postAggregate<ArticuloOrden>(`${urlOrdenes}/${idOrden}/articulos`, payload);
};

export const POST_finalizarOrden = async (id: string): Promise<Result<void>> => {
  return await postAggregateItem<void>(`${urlOrdenes}/${id}/finalizar`, "");
};
