import { useEffect, useMemo, useState } from 'react';
import type { RegistrarEventoPayload, RegistrarIncidenciaPayload } from '../../../model/aggregates/RegistroTrabajo';
import type { RegistroEventoLike } from './useTerminalPauseFlow';

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

type RegistrarIncidenciaMutation = {
  mutate: (
    variables: { operacionId: string; payload: RegistrarIncidenciaPayload },
    options?: MutateOptions,
  ) => void;
  isPending: boolean;
};

type UseTerminalIncidenciaFlowParams = {
  operacionId?: string;
  operacionEstado?: string | number;
  hasRegistroActivo: boolean;
  currentEventType: number | null;
  eventosRegistro: RegistroEventoLike[];
  registrarIncidenciaMutation: RegistrarIncidenciaMutation;
  registrarEventoMutation: RegistrarEventoMutation;
  onError: (message: string) => void;
};

const normalizeEstado = (value?: string | number): string => {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const getEventType = (evento: RegistroEventoLike): number | undefined => {
  const raw = evento as Record<string, unknown>;
  return toNumber(
    raw.idTipoEvento ??
      raw.IdTipoEvento ??
      raw.tipoEventoId ??
      raw.TipoEventoId ??
      raw.idEventoTipo ??
      raw.IdEventoTipo,
  );
};

const getEventStartMs = (evento: RegistroEventoLike): number => {
  const raw = evento as Record<string, unknown>;
  const start = String(raw.inicio ?? raw.Inicio ?? '');
  const parsed = new Date(start).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getEventFin = (evento: RegistroEventoLike): string | null | undefined => {
  const raw = evento as Record<string, unknown>;
  const fin = raw.fin ?? raw.Fin;
  if (fin === null || fin === undefined) return fin as null | undefined;
  return String(fin);
};

export const useTerminalIncidenciaFlow = ({
  operacionId,
  operacionEstado,
  hasRegistroActivo,
  currentEventType,
  eventosRegistro,
  registrarIncidenciaMutation,
  registrarEventoMutation,
  onError,
}: UseTerminalIncidenciaFlowParams) => {
  const [isIncidenciaDialogOpen, setIsIncidenciaDialogOpen] = useState(false);
  const [selectedIncidenciaId, setSelectedIncidenciaId] = useState('');
  const [incidenciaComentario, setIncidenciaComentario] = useState('');
  const [isIncidenciaLocalActiva, setIsIncidenciaLocalActiva] = useState(false);
  const [resumeEventType, setResumeEventType] = useState<number | null>(null);

  useEffect(() => {
    setIsIncidenciaDialogOpen(false);
    setSelectedIncidenciaId('');
    setIncidenciaComentario('');
    setIsIncidenciaLocalActiva(false);
    setResumeEventType(null);
  }, [operacionId]);

  const eventosNormalizados = useMemo(
    () =>
      eventosRegistro
        .map((evento) => ({
          tipo: getEventType(evento),
          startMs: getEventStartMs(evento),
          fin: getEventFin(evento),
        }))
        .filter(
          (evento): evento is { tipo: number; startMs: number; fin: string | null | undefined } =>
            typeof evento.tipo === 'number',
        )
        .sort((a, b) => b.startMs - a.startMs),
    [eventosRegistro],
  );

  const activeIncidenciaEvent = useMemo(
    () => eventosNormalizados.find((evento) => evento.tipo === 3 && !evento.fin),
    [eventosNormalizados],
  );

  const backendResumeEventType = useMemo(() => {
    if (activeIncidenciaEvent) {
      const previousBeforeIncidencia = eventosNormalizados.find(
        (evento) => evento.tipo !== 3 && evento.startMs < activeIncidenciaEvent.startMs,
      );
      return previousBeforeIncidencia?.tipo ?? null;
    }

    const latestNonIncidencia = eventosNormalizados.find((evento) => evento.tipo !== 3);
    return latestNonIncidencia?.tipo ?? null;
  }, [activeIncidenciaEvent, eventosNormalizados]);

  const isIncidentadoBackend = normalizeEstado(operacionEstado).includes('incid');
  const isIncidenciaActiva = isIncidenciaLocalActiva || isIncidentadoBackend || Boolean(activeIncidenciaEvent);

  const handleOpenIncidenciaDialog = () => {
    if (!operacionId || !hasRegistroActivo) return;

    setSelectedIncidenciaId('');
    setIncidenciaComentario('');
    setIsIncidenciaDialogOpen(true);
  };

  const handleConfirmIncidencia = () => {
    if (!operacionId || !selectedIncidenciaId) return;

    const idTipoIncidencia = Number(selectedIncidenciaId);
    if (!Number.isFinite(idTipoIncidencia)) {
      onError('No se pudo determinar el motivo de la incidencia.');
      return;
    }

    registrarIncidenciaMutation.mutate(
      {
        operacionId,
        payload: {
          idTipoIncidencia,
          comentario: incidenciaComentario.trim(),
        },
      },
      {
        onSuccess: () => {
          setIsIncidenciaLocalActiva(true);
          setResumeEventType(backendResumeEventType ?? currentEventType);
          setIsIncidenciaDialogOpen(false);
          setSelectedIncidenciaId('');
          setIncidenciaComentario('');
        },
        onError: (error) => {
          onError(error.message || 'No se pudo enviar la incidencia.');
        },
      },
    );
  };

  const handleResumeIncidencia = () => {
    if (!operacionId) return;

    const previousEventType = resumeEventType ?? backendResumeEventType ?? currentEventType;
    if (previousEventType === null) {
      onError('No se pudo determinar el evento previo para reanudar.');
      return;
    }

    registrarEventoMutation.mutate(
      {
        operacionId,
        payload: { idTipoEvento: previousEventType },
      },
      {
        onSuccess: () => {
          setIsIncidenciaLocalActiva(false);
          setResumeEventType(null);
        },
        onError: (error) => {
          onError(error.message || 'No se pudo reanudar el trabajo.');
        },
      },
    );
  };

  return {
    isIncidenciaDialogOpen,
    setIsIncidenciaDialogOpen,
    selectedIncidenciaId,
    setSelectedIncidenciaId,
    incidenciaComentario,
    setIncidenciaComentario,
    isIncidenciaActiva,
    handleOpenIncidenciaDialog,
    handleConfirmIncidencia,
    handleResumeIncidencia,
    isIncidenciaLoading: registrarIncidenciaMutation.isPending || registrarEventoMutation.isPending,
  };
};
