import type { ArticuloResponse } from '../../../../model/aggregates/Articulos';
import type { OperacionResponse } from '../../../../model/aggregates/Operaciones';
import styles from './ProjectScopeCard.module.css';

export const getCantidadOperacionesArticulo = (articulo: ArticuloResponse, fallbackCount: number): number => {
  const rawCount = articulo.cantidadOperaciones ?? articulo.CantidadOperaciones;
  return (typeof rawCount === 'number' && Number.isFinite(rawCount)) ? rawCount : fallbackCount;
};

export const getProgresoLabel = (operacion: OperacionResponse): string => {
  const total = operacion.cantidadTotal || 0;
  const completado = (operacion.cantidadProducida || 0) + (operacion.cantidadRechazada || 0);
  const porcentajeCalculado = total > 0 ? Math.round((completado / total) * 100) : 0;
  const porcentaje = Number.isFinite(operacion.progreso) ? (operacion.progreso as number) : porcentajeCalculado;
  return `${porcentaje.toFixed(2)}% ${completado}/${total}`;
};

export const getScopeChipClass = (estado: string): string => {
  return `${styles['scope-chip']} ${styles[`scope-chip-${estado}`] ?? styles['scope-chip-desconocido']}`;
};