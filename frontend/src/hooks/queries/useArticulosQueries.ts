import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../api/useApi';
import type { ProblemDetails } from '../../model/aggregates/ProblemDetails';
import type { ArticuloOrden } from '../../model/aggregates/Ordenes';
import type { PagedResult } from '../../model/PagedResult';
import type {
  ArticuloResponse,
  UpdateArticuloPayload,
} from '../../model/aggregates/Articulos';
import type { CreateOperacionPayload, OperacionResponse } from '../../model/aggregates/Operaciones';

const ARTICULOS_QUERY_KEY = ['articulos'] as const;

type ArticulosFilters = {
  soloPendientes?: boolean;
  estado?: string;
  referencia?: string;
  descripcion?: string;
};

const toErrorMessage = (error?: string | ProblemDetails): string => {
  if (typeof error === 'string') return error;
  return String(error?.detail || error?.message || error?.title || 'Error al procesar la solicitud de articulos.');
};

const extractArticulos = (payload: unknown): ArticuloResponse[] => {
  if (Array.isArray(payload)) return payload as ArticuloResponse[];

  if (payload && typeof payload === 'object') {
    const data = payload as { items?: unknown };
    if (Array.isArray(data.items)) return data.items as ArticuloResponse[];
  }

  return [];
};

const sortArticulos = (list: ArticuloResponse[]): ArticuloResponse[] => {
  return [...list].sort((a, b) => a.linea - b.linea);
};

export const useGetArticulos = (
  pageNumber = 1,
  pageSize = 20,
  filters?: ArticulosFilters,
) => {
  const { getArticulos } = useApi();

  return useQuery<ArticuloResponse[], Error>({
    queryKey: [
      ...ARTICULOS_QUERY_KEY,
      'list',
      pageNumber,
      pageSize,
      filters?.soloPendientes ?? null,
      filters?.estado ?? null,
      filters?.referencia ?? null,
      filters?.descripcion ?? null,
    ],
    queryFn: async () => {
      const result = await getArticulos(pageNumber, pageSize, filters);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return sortArticulos(extractArticulos(result.value as unknown));
    },
  });
};

export const useGetArticulosPaged = (
  pageNumber = 1,
  pageSize = 20,
  filters?: ArticulosFilters,
) => {
  const { getArticulos } = useApi();

  return useQuery<PagedResult<ArticuloResponse>, Error>({
    queryKey: [
      ...ARTICULOS_QUERY_KEY,
      'paged',
      pageNumber,
      pageSize,
      filters?.soloPendientes ?? null,
      filters?.estado ?? null,
      filters?.referencia ?? null,
      filters?.descripcion ?? null,
    ],
    queryFn: async () => {
      const result = await getArticulos(pageNumber, pageSize, filters);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value as PagedResult<ArticuloResponse>;
    },
  });
};

export const useGetArticuloById = (id: string) => {
  const { getArticuloById } = useApi();

  return useQuery<ArticuloResponse, Error>({
    queryKey: [...ARTICULOS_QUERY_KEY, 'detail', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const result = await getArticuloById(id);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
  });
};

export const useGetArticulosOrden = (idOrden: string) => {
  const { getArticulosOrden } = useApi();

  return useQuery<ArticuloOrden[], Error>({
    queryKey: [...ARTICULOS_QUERY_KEY, 'orden', idOrden],
    enabled: Boolean(idOrden),
    queryFn: async () => {
      const result = await getArticulosOrden(idOrden);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
  });
};

type UpdateArticuloParams = {
  id: string;
  payload: UpdateArticuloPayload;
};

type AddOperacionArticuloParams = {
  idArticulo: string;
  payload: CreateOperacionPayload;
};

export const useArticulosMutations = () => {
  const queryClient = useQueryClient();
  const { updateArticulo, deleteArticulo, addOperacionArticulo } = useApi();

  const invalidateArticulos = async () => {
    await queryClient.invalidateQueries({ queryKey: ARTICULOS_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: ['operaciones'] });
  };

  const update = useMutation<ArticuloResponse, Error, UpdateArticuloParams>({
    mutationFn: async ({ id, payload }) => {
      const result = await updateArticulo(id, payload);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: invalidateArticulos,
  });

  const remove = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const result = await deleteArticulo(id);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
    },
    onSuccess: invalidateArticulos,
  });

  const addOperacion = useMutation<OperacionResponse, Error, AddOperacionArticuloParams>({
    mutationFn: async ({ idArticulo, payload }) => {
      const result = await addOperacionArticulo(idArticulo, payload);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: invalidateArticulos,
  });

  return {
    updateArticuloMutation: update,
    deleteArticuloMutation: remove,
    addOperacionArticuloMutation: addOperacion,
  };
};
