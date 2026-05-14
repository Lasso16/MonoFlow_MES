import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../api/useApi';
import type { ProblemDetails } from '../../model/aggregates/ProblemDetails';
import type {
  OperacionProgresoResponse,
  OperacionRegistroResponse,
  OperacionResponse,
  OperacionResumenResponse,
  UpdateOperacionPayload,
} from '../../model/aggregates/Operaciones';

const OPERACIONES_QUERY_KEY = ['operaciones'] as const;

const toErrorMessage = (error?: string | ProblemDetails): string => {
  if (typeof error === 'string') return error;
  return String(error?.detail || error?.message || error?.title || 'Error al procesar la solicitud de operaciones.');
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1';
  }
  return false;
};

const normalizeOperacion = (raw: unknown): OperacionResponse => {
  const data = (raw ?? {}) as OperacionResponse & { UltimaOperacion?: unknown };

  return {
    ...data,
    ultimaOperacion: toBoolean(data.ultimaOperacion ?? data.UltimaOperacion),
  };
};

const extractOperaciones = (payload: unknown): OperacionResponse[] => {
  if (Array.isArray(payload)) return payload.map(normalizeOperacion);

  if (payload && typeof payload === 'object') {
    const data = payload as { items?: unknown };
    if (Array.isArray(data.items)) return data.items.map(normalizeOperacion);
  }

  return [];
};

const extractRegistros = (payload: unknown): OperacionRegistroResponse[] => {
  if (Array.isArray(payload)) return payload as OperacionRegistroResponse[];

  if (payload && typeof payload === 'object') {
    const data = payload as { items?: unknown };
    if (Array.isArray(data.items)) return data.items as OperacionRegistroResponse[];
  }

  return [];
};

const extractOperacionResumen = (payload: unknown): OperacionResumenResponse => {
  return (payload ?? {}) as OperacionResumenResponse;
};

export const useGetOperaciones = (pageNumber = 1, pageSize = 20) => {
  const { getOperaciones } = useApi();

  return useQuery<OperacionResponse[], Error>({
    queryKey: [...OPERACIONES_QUERY_KEY, 'list', pageNumber, pageSize],
    queryFn: async () => {
      const result = await getOperaciones(pageNumber, pageSize);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return extractOperaciones(result.value as unknown);
    },
  });
};

export const useGetOperacionesArticulo = (idArticulo: string) => {
  const { getOperacionesArticulo } = useApi();

  return useQuery<OperacionResponse[], Error>({
    queryKey: [...OPERACIONES_QUERY_KEY, 'articulo', idArticulo],
    enabled: Boolean(idArticulo),
    queryFn: async () => {
      const result = await getOperacionesArticulo(idArticulo);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return extractOperaciones(result.value as unknown);
    },
  });
};

export const useGetOperacionesArticulos = (idArticulos: string[]) => {
  const { getOperacionesArticulo } = useApi();

  const uniqueIds = Array.from(new Set(idArticulos.filter(Boolean)));

  const queries = useQueries({
    queries: uniqueIds.map((idArticulo) => ({
      queryKey: [...OPERACIONES_QUERY_KEY, 'articulo', idArticulo],
      enabled: Boolean(idArticulo),
      queryFn: async () => {
        const result = await getOperacionesArticulo(idArticulo);
        if (result.isFailure) throw new Error(toErrorMessage(result.error));
        return extractOperaciones(result.value as unknown);
      },
    })),
  });

  const operacionesByArticuloId = uniqueIds.reduce<Record<string, OperacionResponse[]>>(
    (accumulator, idArticulo, index) => {
      accumulator[idArticulo] = queries[index]?.data ?? [];
      return accumulator;
    },
    {},
  );

  return {
    operacionesByArticuloId,
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError),
  };
};

export const useGetOperacionById = (id: string) => {
  const { getOperacionById } = useApi();

  return useQuery<OperacionResponse, Error>({
    queryKey: [...OPERACIONES_QUERY_KEY, id, 'detalle'],
    enabled: Boolean(id),
    queryFn: async () => {
      const result = await getOperacionById(id);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
  });
};

export const useGetOperacionProgreso = (id: string) => {
  const { getOperacionProgreso } = useApi();

  return useQuery<OperacionProgresoResponse, Error>({
    queryKey: [...OPERACIONES_QUERY_KEY, id, 'progreso'],
    enabled: Boolean(id),
    queryFn: async () => {
      const result = await getOperacionProgreso(id);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
  });
};

export const useGetOperacionRegistros = (id: string) => {
  const { getOperacionRegistros } = useApi();

  return useQuery<OperacionRegistroResponse[], Error>({
    queryKey: [...OPERACIONES_QUERY_KEY, id, 'registros'],
    enabled: Boolean(id),
    queryFn: async () => {
      const result = await getOperacionRegistros(id);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return extractRegistros(result.value as unknown);
    },
  });
};

export const useGetOperacionResumen = (id: string) => {
  const { getOperacionResumen } = useApi();

  return useQuery<OperacionResumenResponse, Error>({
    queryKey: [...OPERACIONES_QUERY_KEY, id, 'resumen'],
    enabled: Boolean(id),
    queryFn: async () => {
      const result = await getOperacionResumen(id);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return extractOperacionResumen(result.value as unknown);
    },
  });
};

type UpdateOperacionParams = {
  id: string;
  payload: UpdateOperacionPayload;
};

export const useOperacionMutations = () => {
  const queryClient = useQueryClient();
  const { updateOperacion, deleteOperacion } = useApi();

  const invalidateOperaciones = async () => {
    await queryClient.invalidateQueries({ queryKey: OPERACIONES_QUERY_KEY });
  };

  const update = useMutation<OperacionResponse, Error, UpdateOperacionParams>({
    mutationFn: async ({ id, payload }) => {
      const result = await updateOperacion(id, payload);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: invalidateOperaciones,
  });

  const remove = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const result = await deleteOperacion(id);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
    },
    onSuccess: invalidateOperaciones,
  });

  return {
    updateOperacionMutation: update,
    deleteOperacionMutation: remove,
  };
};
