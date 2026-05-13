import { Result } from "../model/Result";
import { type Operario, type UpdateOperario, type CreateOperario, type OperarioFilters } from "../model/aggregates/Operarios";
import { type CerrarSesionOperarioResponse, type RegistroActivoOperarioResponse } from "../model/aggregates/RegistroTrabajo";
import { API_URL, deleteAggregateItem, getAggregateItem, getAggregateList, postAggregateItem, putAggregateItem } from "./apiClient";

const urlOperarios = `${API_URL}/operarios`;

export type { OperarioFilters };

export const buildOperariosQuery = (filters?: OperarioFilters): string => {
  if (!filters) return "";

  const params = new URLSearchParams();

  if (filters.nombre && filters.nombre.trim() !== "") {
    params.set("Nombre", filters.nombre.trim());
  }

  if (typeof filters.numeroOperario === "number") {
    params.set("NumeroOperario", String(filters.numeroOperario));
  }

  if (typeof filters.activo === "boolean") {
    params.set("Activo", String(filters.activo));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const GET_operarios = async (filters?: OperarioFilters): Promise<Result<Operario[]>> => {
  const query = buildOperariosQuery(filters);
  return await getAggregateList<Operario[]>(`${urlOperarios}${query}`);
};

export const GET_operarioById = async (id: string): Promise<Result<Operario>> => {
  return await getAggregateItem<Operario>(urlOperarios, id);
};

export const extractOperariosFromPayload = (payload: unknown): Operario[] => {
  if (Array.isArray(payload)) return payload as Operario[];

  if (payload && typeof payload === "object") {
    const wrapped = payload as { value?: unknown; items?: unknown };

    if (Array.isArray(wrapped.value)) return wrapped.value as Operario[];
    if (Array.isArray(wrapped.items)) return wrapped.items as Operario[];

    if (wrapped.value && typeof wrapped.value === "object") {
      const nested = wrapped.value as { items?: unknown };
      if (Array.isArray(nested.items)) return nested.items as Operario[];
    }
  }

  return [];
};

export const GET_operarioByNumero = async (numero: number): Promise<Result<Operario>> => {
  const result = await GET_operarios({ numeroOperario: numero });

  if (result.isFailure) {
    return Result.failure<Operario>(result.error ?? "No se pudo filtrar por numero de operario.");
  }

  const operarios = extractOperariosFromPayload(result.value as unknown);
  const operario = operarios[0];
  if (!operario) {
    return Result.failure<Operario>("Operario no encontrado para ese numero.");
  }

  return Result.success(operario);
};

export const POST_operario = async (payload: CreateOperario): Promise<Result<Operario>> => {
  return await postAggregateItem<Operario>(urlOperarios, JSON.stringify(payload));
};

export const PUT_operario = async (id: string, payload: UpdateOperario): Promise<Result<Operario>> => {
  return await putAggregateItem<Operario>(urlOperarios, id, JSON.stringify(payload));
};

export const DELETE_operario = async (id: string): Promise<Result<void>> => {
  return await deleteAggregateItem(urlOperarios, id);
};

export const PUT_cerrarSesionOperario = async (id: string): Promise<Result<CerrarSesionOperarioResponse>> => {
  return await putAggregateItem<CerrarSesionOperarioResponse>(`${urlOperarios}/${id}/cerrar-sesion`, "", JSON.stringify({}));
};

export const GET_registroActivoOperario = async (id: string): Promise<Result<RegistroActivoOperarioResponse>> => {
  return await getAggregateList<RegistroActivoOperarioResponse>(`${urlOperarios}/${id}/registro-activo`);
};
