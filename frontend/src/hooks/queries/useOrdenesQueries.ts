import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// 🔥 IMPORTAMOS LAS NUEVAS FUNCIONES DIRECTAMENTE DESDE EL BARRIL
import {
  GET_ordenes,
  GET_ordenById,
  GET_estadoPlanta,
  POST_orden,
  PUT_orden,
  DELETE_orden,
  POST_articuloOrden,
  POST_finalizarOrden,
  POST_ordenArticulo
} from '../../api';

import type { PagedResult } from '../../model/PagedResult';
import type { ProblemDetails } from '../../model/aggregates/ProblemDetails';
import type {
  ArticuloOrden,
  CreateArticuloOrden,
  CreateArticuloPayload,
  CreateOrdenPayload,
  EstadoPlantaDTO,
  Orden,
  OrdenFilters,
  UpdateOrden,
} from '../../model/aggregates/Ordenes';

const ORDENES_QUERY_KEY = ['ordenes'] as const;

const toErrorMessage = (error?: string | ProblemDetails): string => {
  if (typeof error === 'string') return error;
  return String(error?.detail || error?.message || error?.title || 'Error al procesar la solicitud de ordenes.');
};

export const extractOrdenes = (payload: unknown): Orden[] => {
  if (Array.isArray(payload)) return payload as Orden[];

  if (payload && typeof payload === 'object') {
    const data = payload as {
      items?: unknown;
      Items?: unknown;
      value?: unknown;
    };

    if (Array.isArray(data.items)) return data.items as Orden[];
    if (Array.isArray(data.Items)) return data.Items as Orden[];
    if (Array.isArray(data.value)) return data.value as Orden[];

    if (data.value && typeof data.value === 'object') {
      const nested = data.value as { items?: unknown; Items?: unknown };
      if (Array.isArray(nested.items)) return nested.items as Orden[];
      if (Array.isArray(nested.Items)) return nested.Items as Orden[];
    }
  }

  return [];
};

export const extractPagedOrdenes = (payload: any): PagedResult<Orden> => {
  // 1. Entramos al envoltorio "value" que devuelve el backend C#
  const data = payload?.value ?? payload;

  // 2. Extraemos el array real
  const items = data?.items ?? data?.Items ?? data?.$values ?? [];
  return {
    Items: items, // AdminOrdersPage lee data?.Items (con mayúscula)
    TotalRecords: Number(data?.totalRecords ?? data?.TotalRecords ?? items.length),
    PageNumber: Number(data?.pageNumber ?? data?.PageNumber ?? 1),
    PageSize: Number(data?.pageSize ?? data?.PageSize ?? 20),
  };
};

const extractEstadoPlanta = (payload: unknown): EstadoPlantaDTO[] => {
  if (Array.isArray(payload)) return payload as EstadoPlantaDTO[];

  if (payload && typeof payload === 'object') {
    const data = payload as { value?: unknown; items?: unknown; Items?: unknown };
    if (Array.isArray(data.value)) return data.value as EstadoPlantaDTO[];
    if (Array.isArray(data.items)) return data.items as EstadoPlantaDTO[];
    if (Array.isArray(data.Items)) return data.Items as EstadoPlantaDTO[];
  }

  return [];
};

export const useGetOrdenes = (
  pageNumber = 1,
  pageSize = 20,
  filters?: OrdenFilters,
  enabled = true,
) => {
  return useQuery<PagedResult<Orden>, Error>({
    queryKey: [...ORDENES_QUERY_KEY, 'list', pageNumber, pageSize, filters ?? {}],
    enabled,
    queryFn: async () => {
      const result = await GET_ordenes(pageNumber, pageSize, filters);
      
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      
    
      return result.value; 
    },
  });
};

export const useGetOrdenById = (id: string) => {
  return useQuery<Orden, Error>({
    queryKey: [...ORDENES_QUERY_KEY, 'detail', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const result = await GET_ordenById(id);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
  });
};

export const useGetEstadoPlanta = () => {
  return useQuery<EstadoPlantaDTO[], Error>({
    queryKey: [...ORDENES_QUERY_KEY, 'estado-planta'],
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const result = await GET_estadoPlanta();
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return extractEstadoPlanta(result.value);
    },
  });
};

type UpdateOrdenParams = {
  id: string;
  payload: UpdateOrden;
};

type AddArticuloOrdenParams = {
  idOrden: string;
  payload: CreateArticuloOrden;
};

export const useOrdenesMutations = () => {
  const queryClient = useQueryClient();

  const invalidateOrdenes = async () => {
    await queryClient.invalidateQueries({ queryKey: ORDENES_QUERY_KEY });
  };

  const create = useMutation<Orden, Error, CreateOrdenPayload>({
    mutationFn: async (payload) => {
      const result = await POST_orden(payload);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: invalidateOrdenes,
  });

  const update = useMutation<Orden, Error, UpdateOrdenParams>({
    mutationFn: async ({ id, payload }) => {
      const result = await PUT_orden(id, payload);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: invalidateOrdenes,
  });

  const remove = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const result = await DELETE_orden(id);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
    },
    onSuccess: invalidateOrdenes,
  });

  const addArticulo = useMutation<ArticuloOrden, Error, AddArticuloOrdenParams>({
    mutationFn: async ({ idOrden, payload }) => {
      const result = await POST_articuloOrden(idOrden, payload);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: invalidateOrdenes,
  });

  const finalizar = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const result = await POST_finalizarOrden(id);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
    },
    onSuccess: invalidateOrdenes,
  });

  return {
    createOrdenMutation: create,
    updateOrdenMutation: update,
    deleteOrdenMutation: remove,
    addArticuloOrdenMutation: addArticulo,
    finalizarOrdenMutation: finalizar,
  };
};

export const useCreateOrdenMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOrdenPayload) => {
      const result = await POST_orden(payload);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ordenes'] }),
  });
};

export const useCreateArticuloOrdenMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ idOrden, payload }: { idOrden: string; payload: CreateArticuloPayload }) => {
      const result = await POST_ordenArticulo(idOrden, payload);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['articulos', 'orden', variables.idOrden] });
    },
  });
};