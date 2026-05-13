import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../api/useApi';
import type { ProblemDetails } from '../../model/aggregates/ProblemDetails';
import type {
  CreateOperario,
  Operario,
  OperarioFilters,
  UpdateOperario,
} from '../../model/aggregates/Operarios';

const OPERARIOS_QUERY_KEY = ['operarios'] as const;

const toErrorMessage = (error?: string | ProblemDetails): string => {
  if (typeof error === 'string') return error;
  return error?.detail || error?.title || 'Error al procesar la solicitud de operarios.';
};

const extractOperarios = (payload: unknown): Operario[] => {
  if (Array.isArray(payload)) return payload as Operario[];

  if (payload && typeof payload === 'object') {
    const data = payload as {
      items?: unknown;
      Items?: unknown;
      value?: unknown;
    };

    if (Array.isArray(data.items)) return data.items as Operario[];
    if (Array.isArray(data.Items)) return data.Items as Operario[];
    if (Array.isArray(data.value)) return data.value as Operario[];

    if (data.value && typeof data.value === 'object') {
      const nested = data.value as { items?: unknown; Items?: unknown };
      if (Array.isArray(nested.items)) return nested.items as Operario[];
      if (Array.isArray(nested.Items)) return nested.Items as Operario[];
    }
  }

  return [];
};

const sortOperarios = (list: Operario[]): Operario[] => {
  return [...list].sort((a, b) => a.numeroOperario - b.numeroOperario);
};

type GetOperariosQueryOptions = {
  refetchInterval?: number | false;
};

export const useGetOperarios = (filters?: OperarioFilters, options?: GetOperariosQueryOptions) => {
  const { getOperarios } = useApi();

  return useQuery<Operario[], Error>({
    queryKey: [...OPERARIOS_QUERY_KEY, filters ?? {}],
    refetchInterval: options?.refetchInterval,
    queryFn: async () => {
      const result = await getOperarios(filters);

      if (result.isFailure) {
        throw new Error(toErrorMessage(result.error));
      }

      return sortOperarios(extractOperarios(result.value as unknown));
    },
  });
};

type UpdateOperarioParams = {
  id: string;
  payload: UpdateOperario;
};

export const useOperariosMutations = () => {
  const queryClient = useQueryClient();
  const { createOperario, updateOperario, deleteOperario } = useApi();

  const invalidateOperarios = async () => {
    await queryClient.invalidateQueries({ queryKey: OPERARIOS_QUERY_KEY });
  };

  const create = useMutation<Operario, Error, CreateOperario>({
    mutationFn: async (payload) => {
      const result = await createOperario(payload);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: invalidateOperarios,
  });

  const update = useMutation<Operario, Error, UpdateOperarioParams>({
    mutationFn: async ({ id, payload }) => {
      const result = await updateOperario(id, payload);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: invalidateOperarios,
  });

  const remove = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const result = await deleteOperario(id);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
    },
    onSuccess: invalidateOperarios,
  });

  return {
    createOperarioMutation: create,
    updateOperarioMutation: update,
    deleteOperarioMutation: remove,
  };
};
