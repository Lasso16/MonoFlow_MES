import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../api/useApi';
import type {
  AbrirRegistroTrabajoPayload,
  AbrirRegistroTrabajoResponse,
  CerrarSesionOperarioResponse,
  FinalizarRegistroTrabajoResponse,
  IncidenciaResponse,
  ObservacionMethod,
  ObservacionRegistroTrabajoPayload,
  ObservacionRegistroTrabajoResponse,
  ProduccionResponse,
  RegistrarEventoPayload,
  RegistrarEventoResponse,
  RegistrarIncidenciaPayload,
  RegistrarProduccionPayload,
  RegistrarRechazoPayload,
  RechazoResponse,
  RegistroActualOperacionDTO,
  RegistroActivoOperarioResponse,
} from '../../model/aggregates/RegistroTrabajo';

const OPERACIONES_QUERY_KEY = ['operaciones'] as const;
const OPERARIOS_QUERY_KEY = ['operarios'] as const;

const toErrorMessage = (error?: any): string => {
  if (!error) return 'Error desconocido al procesar la solicitud.';
  if (typeof error === 'string') return error;

  return error.detail || error.message || error.title || 'Error al procesar la solicitud de registro de trabajo.';
};

const extractRegistroActivo = (payload: unknown): RegistroActivoOperarioResponse => {
  if (payload && typeof payload === 'object') {
    const data = payload as { value?: unknown };

    if (data.value && typeof data.value === 'object') {
      return data.value as RegistroActivoOperarioResponse;
    }
  }

  return payload as RegistroActivoOperarioResponse;
};

const extractRegistroActualOperacion = (payload: unknown): RegistroActualOperacionDTO => {
  if (payload && typeof payload === 'object') {
    const data = payload as { value?: unknown };

    if (data.value && typeof data.value === 'object') {
      return data.value as RegistroActualOperacionDTO;
    }
  }

  return payload as RegistroActualOperacionDTO;
};

const invalidateOperacionSeguimiento = async (
  queryClient: ReturnType<typeof useQueryClient>,
  operacionId: string,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [...OPERACIONES_QUERY_KEY, operacionId, 'detalle'] }),
    queryClient.invalidateQueries({ queryKey: [...OPERACIONES_QUERY_KEY, operacionId, 'progreso'] }),
    queryClient.invalidateQueries({ queryKey: [...OPERACIONES_QUERY_KEY, operacionId, 'resumen'] }),
  ]);

  // Refetch inmediato del registro-trabajo para mantener sincronizada la UI.
  await queryClient.refetchQueries({
    queryKey: [...OPERACIONES_QUERY_KEY, operacionId, 'registro-trabajo'],
    type: 'active',
  });
};

const invalidateRegistroActivoOperario = async (
  queryClient: ReturnType<typeof useQueryClient>,
  operarioId: string,
) => {
  await queryClient.invalidateQueries({ queryKey: [...OPERARIOS_QUERY_KEY, operarioId, 'registro-activo'] });
};

export const useGetRegistroActivoOperario = (operarioId: string) => {
  const { getRegistroActivoOperario } = useApi();

  return useQuery<RegistroActivoOperarioResponse, Error>({
    queryKey: [...OPERARIOS_QUERY_KEY, operarioId, 'registro-activo'],
    enabled: Boolean(operarioId),
    queryFn: async () => {
      const result = await getRegistroActivoOperario(operarioId);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return extractRegistroActivo(result.value as unknown);
    },
  });
};

export const useGetRegistroActualOperacion = (operacionId?: string) => {
  const { getRegistroActualOperacion } = useApi();

  return useQuery<RegistroActualOperacionDTO | null, Error>({
    queryKey: [...OPERACIONES_QUERY_KEY, operacionId, 'registro-trabajo'],
    enabled: !!operacionId,
    refetchInterval: (query) => {
      const data = query.state.data as
        | (RegistroActualOperacionDTO & { Finalizado?: boolean })
        | null
        | undefined;

      const isFinalizado = data?.finalizado ?? data?.Finalizado;
      return data && !isFinalizado ? 10000 : false;
    },
    retry: false,
    queryFn: async () => {
      const result = await getRegistroActualOperacion(operacionId ?? '');
      if (result.isFailure) return null;
      return extractRegistroActualOperacion(result.value as unknown);
    },
  });
};

type AbrirRegistroParams = {
  operacionId: string;
  payload: AbrirRegistroTrabajoPayload;
};

type FinalizarRegistroParams = {
  operacionId: string;
  operarioIds?: string[];
};

type ProduccionParams = {
  operacionId: string;
  payload: RegistrarProduccionPayload;
};

type RechazoParams = {
  operacionId: string;
  payload: RegistrarRechazoPayload;
};

type EventoParams = {
  operacionId: string;
  payload: RegistrarEventoPayload;
};

type IncidenciaParams = {
  operacionId: string;
  payload: RegistrarIncidenciaPayload;
};

type ObservacionParams = {
  operacionId: string;
  payload: ObservacionRegistroTrabajoPayload;
  method: ObservacionMethod;
};

export const useRegistroTrabajoMutations = () => {
  const queryClient = useQueryClient();
  const {
    abrirRegistroTrabajo,
    finalizarRegistroTrabajo,
    registrarProduccion,
    registrarRechazo,
    registrarEvento,
    registrarIncidencia,
    addObservacionRegistroTrabajo,
    cerrarSesionOperario,
  } = useApi();

  const abrir = useMutation<AbrirRegistroTrabajoResponse, Error, AbrirRegistroParams>({
    mutationFn: async ({ operacionId, payload }) => {
      const result = await abrirRegistroTrabajo(operacionId, payload);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: async (_data, variables) => {
      await invalidateOperacionSeguimiento(queryClient, variables.operacionId);
      await Promise.all(
        variables.payload.idOperarios.map((operarioId) =>
          invalidateRegistroActivoOperario(queryClient, operarioId),
        ),
      );
    },
    onError: async (_error, variables) => {
      await invalidateOperacionSeguimiento(queryClient, variables.operacionId);
    },
  });

  const finalizar = useMutation<FinalizarRegistroTrabajoResponse, Error, FinalizarRegistroParams>({
    mutationFn: async ({ operacionId }) => {
      const result = await finalizarRegistroTrabajo(operacionId);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: async (_data, variables) => {
      await invalidateOperacionSeguimiento(queryClient, variables.operacionId);
      if (variables.operarioIds?.length) {
        await Promise.all(
          variables.operarioIds.map((operarioId) =>
            invalidateRegistroActivoOperario(queryClient, operarioId),
          ),
        );
      }
    },
  });

  const produccion = useMutation<ProduccionResponse, Error, ProduccionParams>({
    mutationFn: async ({ operacionId, payload }) => {
      const result = await registrarProduccion(operacionId, payload);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: async (_data, variables) => {
      await invalidateOperacionSeguimiento(queryClient, variables.operacionId);
    },
  });

  const rechazo = useMutation<RechazoResponse, Error, RechazoParams>({
    mutationFn: async ({ operacionId, payload }) => {
      const result = await registrarRechazo(operacionId, payload);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: async (_data, variables) => {
      await invalidateOperacionSeguimiento(queryClient, variables.operacionId);
    },
  });

  const evento = useMutation<RegistrarEventoResponse, Error, EventoParams>({
    mutationFn: async ({ operacionId, payload }) => {
      const result = await registrarEvento(operacionId, payload);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: async (_data, variables) => {
      await invalidateOperacionSeguimiento(queryClient, variables.operacionId);
    },
  });

  const incidencia = useMutation<IncidenciaResponse, Error, IncidenciaParams>({
    mutationFn: async ({ operacionId, payload }) => {
      const result = await registrarIncidencia(operacionId, payload);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: async (_data, variables) => {
      await invalidateOperacionSeguimiento(queryClient, variables.operacionId);
    },
  });

  const observacion = useMutation<ObservacionRegistroTrabajoResponse, Error, ObservacionParams>({
    mutationFn: async ({ operacionId, payload, method }) => {
      const result = await addObservacionRegistroTrabajo(operacionId, payload, method);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: async (_data, variables) => {
      await invalidateOperacionSeguimiento(queryClient, variables.operacionId);
    },
  });

  const cerrarSesion = useMutation<CerrarSesionOperarioResponse, Error, string>({
    mutationFn: async (operarioId) => {
      const result = await cerrarSesionOperario(operarioId);
      if (result.isFailure) throw new Error(toErrorMessage(result.error));
      return result.value;
    },
    onSuccess: async (_data, operarioId) => {
      await invalidateRegistroActivoOperario(queryClient, operarioId);
      await queryClient.invalidateQueries({ queryKey: OPERACIONES_QUERY_KEY });
    },
  });

  return {
    abrirRegistroTrabajoMutation: abrir,
    finalizarRegistroTrabajoMutation: finalizar,
    registrarProduccionMutation: produccion,
    registrarRechazoMutation: rechazo,
    registrarEventoMutation: evento,
    registrarIncidenciaMutation: incidencia,
    addObservacionRegistroTrabajoMutation: observacion,
    cerrarSesionOperarioMutation: cerrarSesion,
  };
};
