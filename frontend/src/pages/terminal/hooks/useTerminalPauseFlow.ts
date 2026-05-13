import { useEffect, useMemo, useState } from 'react';
import type {
  ObservacionMethod,
  ObservacionRegistroTrabajoPayload,
  RegistrarEventoPayload,
} from '../../../model/aggregates/RegistroTrabajo';

export type RegistroEventoLike = {
  idTipoEvento?: number | string;
  IdTipoEvento?: number | string;
  inicio?: string;
  Inicio?: string;
  fin?: string | null;
  Fin?: string | null;
};

type MutateOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

type RegistrarEventoMutation = {
  mutate: (
    variables: { operacionId: string; payload: RegistrarEventoPayload },
    options?: MutateOptions,
  ) => void;
  isPending: boolean;
};

type AddObservacionMutation = {
  mutate: (
    variables: {
      operacionId: string;
      payload: ObservacionRegistroTrabajoPayload;
      method: ObservacionMethod;
    },
    options?: MutateOptions,
  ) => void;
  isPending: boolean;
};

type UseTerminalPauseFlowParams = {
  operacionId?: string;
  hasRegistroActivo: boolean;
  eventosRegistro: RegistroEventoLike[];
  registrarEventoMutation: RegistrarEventoMutation;
  addObservacionMutation: AddObservacionMutation;
  onError: (message: string) => void;
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const getEventStartTimeMs = (evento: RegistroEventoLike): number => {
  const start = new Date(evento.inicio ?? evento.Inicio ?? '').getTime();
  return Number.isNaN(start) ? 0 : start;
};

const formatObservationTime = (value: number): string => {
  return new Date(value).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const useTerminalPauseFlow = ({
  operacionId,
  hasRegistroActivo,
  eventosRegistro,
  registrarEventoMutation,
  addObservacionMutation,
  onError,
}: UseTerminalPauseFlowParams) => {
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState('Almuerzo');
  const [pauseStartedAtMs, setPauseStartedAtMs] = useState<number | null>(null);
  const [pauseOverrideActive, setPauseOverrideActive] = useState<boolean | null>(null);

  useEffect(() => {
    setIsPauseDialogOpen(false);
    setPauseReason('Almuerzo');
    setPauseStartedAtMs(null);
    setPauseOverrideActive(null);
  }, [operacionId]);

  const activePauseEvent = useMemo(() => {
    const sortedEvents = [...eventosRegistro].sort((a, b) => {
      const inicioA = getEventStartTimeMs(a);
      const inicioB = getEventStartTimeMs(b);

      if (inicioA !== inicioB) return inicioB - inicioA;

      const tipoA = toNumber(a.idTipoEvento ?? a.IdTipoEvento) ?? 0;
      const tipoB = toNumber(b.idTipoEvento ?? b.IdTipoEvento) ?? 0;
      return tipoB - tipoA;
    });

    return sortedEvents.find((evento) => {
      const tipoEvento = toNumber(evento.idTipoEvento ?? evento.IdTipoEvento);
      const finEvento = evento.fin ?? evento.Fin;
      return tipoEvento === 4 && !finEvento;
    });
  }, [eventosRegistro]);

  const pauseStartedFromBackendMs = activePauseEvent
    ? new Date(activePauseEvent.inicio ?? activePauseEvent.Inicio ?? '').getTime()
    : null;

  const pauseStartedAt = pauseStartedAtMs ?? (Number.isNaN(pauseStartedFromBackendMs ?? NaN) ? null : pauseStartedFromBackendMs);
  const isPausaActiva = pauseOverrideActive ?? Boolean(activePauseEvent);

  const resumeEventType = useMemo(() => {
    const normalized = eventosRegistro
      .map((evento) => ({
        tipo: toNumber(evento.idTipoEvento ?? evento.IdTipoEvento),
        startMs: getEventStartTimeMs(evento),
      }))
      .filter((evento): evento is { tipo: number; startMs: number } => typeof evento.tipo === 'number')
      .sort((a, b) => b.startMs - a.startMs);

    const activePauseStartMs = activePauseEvent ? getEventStartTimeMs(activePauseEvent) : null;
    if (activePauseStartMs !== null) {
      const previousBeforePause = normalized.find((evento) => evento.tipo !== 4 && evento.startMs < activePauseStartMs);
      return previousBeforePause?.tipo ?? null;
    }

    const latestNonPause = normalized.find((evento) => evento.tipo !== 4);
    return latestNonPause?.tipo ?? null;
  }, [activePauseEvent, eventosRegistro]);

  const openPauseDialog = () => {
    setPauseReason((current) => current.trim() || 'Almuerzo');
    setIsPauseDialogOpen(true);
  };

  const handlePauseAction = () => {
    if (!operacionId || !hasRegistroActivo) return;

    if (isPausaActiva) {
      if (pauseStartedAt === null) {
        onError('No se pudo recuperar la hora de inicio de la pausa.');
        return;
      }

      if (resumeEventType === null) {
        onError('No se pudo determinar el evento previo para reanudar.');
        return;
      }

      const motivo = pauseReason.trim() || 'Almuerzo';
      const nowMs = Date.now();
      const observacion = `Pausa: ${motivo} (${formatObservationTime(pauseStartedAt)} - ${formatObservationTime(nowMs)})`;

      addObservacionMutation.mutate(
        {
          operacionId,
          payload: { observacion },
          method: 'POST',
        },
        {
          onSuccess: () => {
            registrarEventoMutation.mutate(
              {
                operacionId,
                payload: { idTipoEvento: resumeEventType },
              },
              {
                onSuccess: () => {
                  setPauseOverrideActive(false);
                  setPauseStartedAtMs(null);
                  setPauseReason('Almuerzo');
                },
                onError: (error) => {
                  onError(error.message || 'Se guardó la observación, pero no se pudo reanudar el evento anterior.');
                },
              },
            );
          },
          onError: (error) => {
            onError(error.message || 'No se pudo reanudar el trabajo.');
          },
        },
      );
      return;
    }

    openPauseDialog();
  };

  const handleConfirmPause = () => {
    if (!operacionId || !hasRegistroActivo) return;

    const motivo = pauseReason.trim() || 'Almuerzo';

    registrarEventoMutation.mutate(
      {
        operacionId,
        payload: { idTipoEvento: 4 },
      },
      {
        onSuccess: () => {
          setPauseReason(motivo);
          setPauseStartedAtMs(Date.now());
          setPauseOverrideActive(true);
          setIsPauseDialogOpen(false);
        },
        onError: (error) => {
          onError(error.message || 'No se pudo iniciar la pausa.');
        },
      },
    );
  };

  return {
    isPauseDialogOpen,
    setIsPauseDialogOpen,
    pauseReason,
    setPauseReason,
    isPausaActiva,
    handlePauseAction,
    handleConfirmPause,
    isPauseLoading: registrarEventoMutation.isPending || addObservacionMutation.isPending,
  };
};
