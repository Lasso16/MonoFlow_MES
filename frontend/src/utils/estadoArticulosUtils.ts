import type { ArticuloResponse } from '../model/aggregates/Articulos';

export const ESTADOS = {
  PENDIENTE: '0',
  EN_CURSO: '1',
  FINALIZADA: '2',
} as const;

export type EstadoKind =
  | 'pendiente'
  | 'enpreparacion'
  | 'enejecucion'
  | 'enrecogida'
  | 'finproduccion'
  | 'incidentado'
  | 'pausado'
  | 'detenido'
  | 'desconocido';

const normalizeText = (value?: string | null): string => {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

export const getEstadoKind = (estado?: string | number | null): EstadoKind => {
  if (typeof estado === 'number') {
    const s = String(estado);
    if (s === ESTADOS.PENDIENTE) return 'pendiente';
    if (s === ESTADOS.EN_CURSO) return 'enejecucion';
    if (s === ESTADOS.FINALIZADA) return 'finproduccion';
    if (s === '3') return 'detenido';
    return 'desconocido';
  }

  const normalized = normalizeText(estado);

  if (normalized === ESTADOS.PENDIENTE) return 'pendiente';
  if (normalized === ESTADOS.EN_CURSO) return 'enejecucion';
  if (normalized === ESTADOS.FINALIZADA) return 'finproduccion';
  if (normalized === '3') return 'detenido';

  if (normalized.includes('incident')) {
    return 'incidentado';
  }

  if (normalized.includes('recog')) {
    return 'enrecogida';
  }

  if (normalized.includes('ejec')) {
    return 'enejecucion';
  }

  if (normalized.includes('prepar')) {
    return 'enpreparacion';
  }

  if (normalized.includes('paus')) {
    return 'pausado';
  }

  if (normalized.includes('deten') || normalized.includes('stop')) {
    return 'detenido';
  }

  if (
    normalized.includes('finproduccion') ||
    normalized.includes('fin produ') ||
    normalized.includes('fin de produ') ||
    normalized.includes('finaliz') ||
    normalized.includes('termin') ||
    normalized.includes('complet')
  ) {
    return 'finproduccion';
  }

  if (
    normalized.includes('en curso') ||
    normalized.includes('encurso') ||
    normalized.includes('trabaj') ||
    normalized.includes('activo') ||
    normalized.includes('progreso')
  ) {
    return 'enejecucion';
  }

  if (normalized.includes('pend')) {
    return 'pendiente';
  }

  return 'desconocido';
};

export const getEstadoLabel = (estadoKind: EstadoKind, rawEstado?: string | number | null, context: 'articulo' | 'operacion' = 'articulo'): string => {
  if (estadoKind === 'pendiente') return 'Pendiente';
  if (estadoKind === 'enpreparacion') return 'En preparación';
  if (estadoKind === 'enejecucion') return context === 'operacion' ? 'En ejecución' : 'En curso';
  if (estadoKind === 'enrecogida') return 'En recogida';
  if (estadoKind === 'finproduccion') return 'Fin de producción';
  if (estadoKind === 'incidentado') return 'Incidentado';
  if (estadoKind === 'pausado') return 'Pausado';
  if (estadoKind === 'detenido') return 'Detenido';

  const fallbackEstado = String(rawEstado ?? '').trim();
  if (fallbackEstado !== '') return fallbackEstado;

  return 'Desconocido';
};

export const isArticuloVisible = (articulo: ArticuloResponse): boolean => {
  const estado = getEstadoKind(articulo.estado);
  return estado !== 'finproduccion';
};

export const formatEstado = (estado?: string): string => {
  const normalized = normalizeText(estado);

  if (normalized === ESTADOS.PENDIENTE || normalized.includes('pend')) return 'Pendiente';
  if (normalized === ESTADOS.EN_CURSO || normalized.includes('curso') || normalized.includes('proceso')) return 'En curso';
  if (normalized === ESTADOS.FINALIZADA || normalized.includes('fin') || normalized.includes('final')) return 'Finalizada';

  return estado?.trim() || '-';
};

export const getEstadoColor = (
  estado?: string | number | null,
): 'warning' | 'info' | 'success' | 'default' => {
  const normalized = normalizeText(String(estado ?? ''));

  if (normalized === ESTADOS.PENDIENTE || normalized.includes('pend')) return 'warning';
  if (
    normalized === ESTADOS.EN_CURSO ||
    normalized.includes('curso') ||
    normalized.includes('proceso')
  ) {
    return 'info';
  }
  if (
    normalized === ESTADOS.FINALIZADA ||
    normalized.includes('fin') ||
    normalized.includes('final')
  ) {
    return 'success';
  }

  return 'default';
};
