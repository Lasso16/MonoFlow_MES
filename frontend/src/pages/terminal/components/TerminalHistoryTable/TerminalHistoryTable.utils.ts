import type { EventColorKey } from './TerminalHistoryTable.types';
import styles from './TerminalHistoryTable.module.css';

export const pickText = (...values: Array<string | null | undefined>): string | undefined => {
  for (const value of values) {
    const normalized = value?.trim();
    if (normalized) return normalized;
  }
  return undefined;
};

export const getStringField = (source: Record<string, unknown>, fieldNames: string[]): string | undefined => {
  for (const fieldName of fieldNames) {
    const direct = source[fieldName];
    if (typeof direct === 'string' && direct.trim() !== '') return direct;
  }

  const loweredEntries = Object.entries(source).reduce<Record<string, unknown>>((acc, [key, value]) => {
    acc[key.toLowerCase()] = value;
    return acc;
  }, {});

  for (const fieldName of fieldNames) {
    const value = loweredEntries[fieldName.toLowerCase()];
    if (typeof value === 'string' && value.trim() !== '') return value;
  }

  return undefined;
};

export const toNumber = (value?: number | string): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

export const normalizeText = (value?: string): string => {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

export const formatHora = (value?: string): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const getSortTime = (value?: string): number => {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const formatDuracion = (milliseconds?: number): string => {
  if (!milliseconds || milliseconds < 0) return '-';

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
};

export const parseDateTime = (value?: string): number | undefined => {
  if (!value) return undefined;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const getEventoColor = (eventoTipo: string): EventColorKey => {
  const normalized = normalizeText(eventoTipo);

  if (normalized.includes('pend')) return 'pendiente';
  if (normalized.includes('prepar')) return 'enpreparacion';
  if (normalized.includes('ejec')) return 'enejecucion';
  if (normalized.includes('recog')) return 'enrecogida';
  if (
    normalized.includes('fin produ') ||
    normalized.includes('fin de produ') ||
    normalized.includes('finaliz') ||
    normalized.includes('termin')
  ) {
    return 'finproduccion';
  }
  if (normalized.includes('incidenc') || normalized.includes('error') || normalized.includes('rechazo')) {
    return 'incidentado';
  }
  if (normalized.includes('paus') || normalized.includes('espera')) return 'pausado';
  if (normalized.includes('deten') || normalized.includes('parada') || normalized.includes('stop')) {
    return 'detenido';
  }

  return 'desconocido';
};

export const getHistoryChipClass = (color: EventColorKey): string => {
  return `${styles['history-event-chip']} ${styles[`history-event-${color}`] ?? styles['history-event-desconocido']}`;
};

export const getHistoryLiveClass = (color: EventColorKey): string => {
  return `${styles['history-live-timer']} ${styles[`history-live-${color}`] ?? styles['history-live-desconocido']}`;
};