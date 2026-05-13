import { useMemo } from 'react';
import type { RegistroActualOperacionDTO } from '../../../model/aggregates/RegistroTrabajo';
import type { SesionOperarioDTO } from '../../../model/aggregates/RegistroTrabajo';
import type { RegistroEventoLike } from './useTerminalPauseFlow';

type RegistroActualOperacionLike = RegistroActualOperacionDTO & {
  SesionesActivas?: SesionOperarioDTO[];
  Eventos?: RegistroEventoLike[];
  Finalizado?: boolean;
};

type UseTerminalRegistroStateParams = {
  registroActualOperacion: RegistroActualOperacionLike | null | undefined;
  selectedOperarioIdsCount: number;
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

const getEventEndTime = (evento: RegistroEventoLike): string | null | undefined => {
  const raw = evento as Record<string, unknown>;
  const fin = raw.fin ?? raw.Fin;
  if (fin === null || fin === undefined) return fin as null | undefined;
  return String(fin);
};

export const useTerminalRegistroState = ({
  registroActualOperacion,
  selectedOperarioIdsCount,
}: UseTerminalRegistroStateParams) => {
  const operariosActivosRegistro = useMemo(() => {
    return registroActualOperacion?.sesionesActivas ?? registroActualOperacion?.SesionesActivas ?? [];
  }, [registroActualOperacion]);

  const eventosRegistro = useMemo(() => {
    const eventosRaw = registroActualOperacion?.eventos ?? registroActualOperacion?.Eventos;
    return Array.isArray(eventosRaw) ? (eventosRaw as RegistroEventoLike[]) : [];
  }, [registroActualOperacion]);

  const registroFinalizado =
    registroActualOperacion?.finalizado ?? registroActualOperacion?.Finalizado ?? false;

  const hasRegistroActivo = Boolean(registroActualOperacion && !registroFinalizado);

  const equipoCount =
    operariosActivosRegistro.length > 0 ? operariosActivosRegistro.length : selectedOperarioIdsCount;

  const eventoTiposRegistro = useMemo(() => {
    return eventosRegistro
      .map((evento) => {
        return getEventType(evento);
      })
      .filter((tipo): tipo is number => typeof tipo === 'number');
  }, [eventosRegistro]);

  const currentEvent = useMemo(() => {
    const sortedEvents = [...eventosRegistro].sort((a, b) => {
      const inicioA = new Date(a.inicio ?? a.Inicio ?? '').getTime();
      const inicioB = new Date(b.inicio ?? b.Inicio ?? '').getTime();

      if (inicioA !== inicioB) return inicioB - inicioA;

      const tipoA = getEventType(a) ?? 0;
      const tipoB = getEventType(b) ?? 0;
      return tipoB - tipoA;
    });

    return sortedEvents.find((evento) => getEventType(evento) !== undefined && !getEventEndTime(evento));
  }, [eventosRegistro]);

  const hasPreparacion = eventoTiposRegistro.includes(1);
  const hasEjecucion = eventoTiposRegistro.includes(2);
  const hasRecogida = eventoTiposRegistro.includes(5);

  const nextEventoTipo = useMemo(() => {
    if (!hasRegistroActivo) return null;
    if (hasRecogida) return null;
    if (hasEjecucion) return 5;
    if (hasPreparacion) return 2;
    return 1;
  }, [hasEjecucion, hasPreparacion, hasRecogida, hasRegistroActivo]);

  const startActionLabel = useMemo(() => {
    if (!hasRegistroActivo) return 'Iniciar preparación';
    if (nextEventoTipo === 1) return 'Preparacion';
    if (nextEventoTipo === 2) return 'Ejecucion';
    if (nextEventoTipo === 5) return 'Recogida';
    return 'Proceso completo';
  }, [hasRegistroActivo, nextEventoTipo]);

  const currentEventType = useMemo(() => {
    const activeEventType = currentEvent ? getEventType(currentEvent) : undefined;
    if (typeof activeEventType === 'number') return activeEventType;

    if (hasRecogida) return 5;
    if (hasEjecucion) return 2;
    if (hasPreparacion) return 1;
    return hasRegistroActivo ? 1 : null;
  }, [currentEvent, hasEjecucion, hasPreparacion, hasRecogida, hasRegistroActivo]);

  return {
    operariosActivosRegistro,
    eventosRegistro,
    hasRegistroActivo,
    equipoCount,
    hasRecogida,
    nextEventoTipo,
    startActionLabel,
    currentEventType,
  };
};
