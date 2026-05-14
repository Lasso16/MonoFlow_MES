import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../api/useApi';
import type { TipoEvento, TipoIncidencia, TipoOperacion, TipoRechazo } from '../../model/aggregates/Maestros';
import type { ProblemDetails } from '../../model/aggregates/ProblemDetails';

const MAESTROS_QUERY_KEY = ['maestros'] as const;

const toErrorMessage = (error?: string | ProblemDetails): string => {
  if (typeof error === 'string') return error;
  return String(error?.detail || error?.message || error?.title || 'Error al procesar la solicitud de maestros.');
};

export const useGetTiposRechazo = () => {
  const { getTiposRechazo } = useApi();

  return useQuery<TipoRechazo[], Error>({
    queryKey: [...MAESTROS_QUERY_KEY, 'rechazos'],
    queryFn: async () => {
      const result = await getTiposRechazo();
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
  });
};

export const useGetTiposIncidencia = () => {
  const { getTiposIncidencia } = useApi();

  return useQuery<TipoIncidencia[], Error>({
    queryKey: [...MAESTROS_QUERY_KEY, 'incidencias'],
    queryFn: async () => {
      const result = await getTiposIncidencia();
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
  });
};

export const useGetTiposEvento = () => {
  const { getTiposEvento } = useApi();

  return useQuery<TipoEvento[], Error>({
    queryKey: [...MAESTROS_QUERY_KEY, 'eventos'],
    queryFn: async () => {
      const result = await getTiposEvento();
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
  });
};

const extractTiposOperacion = (payload: unknown): TipoOperacion[] => {
  if (Array.isArray(payload)) return payload as TipoOperacion[];

  if (payload && typeof payload === 'object') {
    const data = payload as { items?: unknown };
    if (Array.isArray(data.items)) return data.items as TipoOperacion[];
  }

  return [];
};

export const useGetTiposOperacion = () => {
  const { getTiposOperacion } = useApi();

  return useQuery<TipoOperacion[], Error>({
    queryKey: [...MAESTROS_QUERY_KEY, 'operaciones'],
    queryFn: async () => {
      const result = await getTiposOperacion();
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return extractTiposOperacion(result.value as unknown);
    },
  });
};

export const useMaestrosMutations = () => {
  const queryClient = useQueryClient();

  const invalidateMaestros = useMutation<void, Error, void>({
    mutationFn: async () => {
      return;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MAESTROS_QUERY_KEY });
    },
  });

  return {
    invalidateMaestrosMutation: invalidateMaestros,
  };
};
