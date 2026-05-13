import { describe, it, expect } from 'vitest';
import {
  getEstadoKind,
  getEstadoLabel,
  isArticuloVisible,
  formatEstado,
  getEstadoColor,
} from './estadoArticulosUtils';

describe('getEstadoKind', () => {
  it('Número 0 → pendiente', () => expect(getEstadoKind(0)).toBe('pendiente'));
  it('Número 1 → enejecucion', () => expect(getEstadoKind(1)).toBe('enejecucion'));
  it('Número 2 → finproduccion', () => expect(getEstadoKind(2)).toBe('finproduccion'));
  it('Número 3 → detenido', () => expect(getEstadoKind(3)).toBe('detenido'));
  it('Número desconocido → desconocido', () => expect(getEstadoKind(99)).toBe('desconocido'));

  it('String "0" → pendiente', () => expect(getEstadoKind('0')).toBe('pendiente'));
  it('String "1" → enejecucion', () => expect(getEstadoKind('1')).toBe('enejecucion'));
  it('String "2" → finproduccion', () => expect(getEstadoKind('2')).toBe('finproduccion'));
  it('String "3" → detenido', () => expect(getEstadoKind('3')).toBe('detenido'));

  it('null → desconocido', () => expect(getEstadoKind(null)).toBe('desconocido'));
  it('undefined → desconocido', () => expect(getEstadoKind(undefined)).toBe('desconocido'));

  it('"Incidencia activa" → desconocido (no contiene "incident")', () => expect(getEstadoKind('Incidencia activa')).toBe('desconocido'));
  it('"Incidente grave" → incidentado', () => expect(getEstadoKind('Incidente grave')).toBe('incidentado'));
  it('"En recogida" → enrecogida', () => expect(getEstadoKind('En recogida')).toBe('enrecogida'));
  it('"En ejecución" → enejecucion', () => expect(getEstadoKind('En ejecución')).toBe('enejecucion'));
  it('"En preparación" → enpreparacion', () => expect(getEstadoKind('En preparación')).toBe('enpreparacion'));
  it('"Pausado" → pausado', () => expect(getEstadoKind('Pausado')).toBe('pausado'));
  it('"Detenido" → detenido', () => expect(getEstadoKind('Detenido')).toBe('detenido'));
  it('"Finalizado" → finproduccion', () => expect(getEstadoKind('Finalizado')).toBe('finproduccion'));
  it('"En curso" → enejecucion', () => expect(getEstadoKind('En curso')).toBe('enejecucion'));
  it('"Pendiente" → pendiente', () => expect(getEstadoKind('Pendiente')).toBe('pendiente'));
});

describe('getEstadoLabel', () => {
  it('pendiente → "Pendiente"', () => expect(getEstadoLabel('pendiente')).toBe('Pendiente'));
  it('enpreparacion → "En preparación"', () => expect(getEstadoLabel('enpreparacion')).toBe('En preparación'));
  it('enejecucion operacion → "En ejecución"', () => expect(getEstadoLabel('enejecucion', undefined, 'operacion')).toBe('En ejecución'));
  it('enejecucion articulo → "En curso"', () => expect(getEstadoLabel('enejecucion', undefined, 'articulo')).toBe('En curso'));
  it('finproduccion → "Fin de producción"', () => expect(getEstadoLabel('finproduccion')).toBe('Fin de producción'));
  it('incidentado → "Incidentado"', () => expect(getEstadoLabel('incidentado')).toBe('Incidentado'));
  it('pausado → "Pausado"', () => expect(getEstadoLabel('pausado')).toBe('Pausado'));
  it('detenido → "Detenido"', () => expect(getEstadoLabel('detenido')).toBe('Detenido'));
  it('desconocido con rawEstado → devuelve rawEstado', () =>
    expect(getEstadoLabel('desconocido', 'MiEstado')).toBe('MiEstado'));
  it('desconocido sin rawEstado → "Desconocido"', () =>
    expect(getEstadoLabel('desconocido')).toBe('Desconocido'));
});

describe('isArticuloVisible', () => {
  it('finproduccion → false', () =>
    expect(isArticuloVisible({ estado: '2' } as any)).toBe(false));
  it('pendiente → true', () =>
    expect(isArticuloVisible({ estado: '0' } as any)).toBe(true));
  it('enejecucion → true', () =>
    expect(isArticuloVisible({ estado: '1' } as any)).toBe(true));
});

describe('formatEstado', () => {
  it('"0" → "Pendiente"', () => expect(formatEstado('0')).toBe('Pendiente'));
  it('"1" → "En curso"', () => expect(formatEstado('1')).toBe('En curso'));
  it('"2" → "Finalizada"', () => expect(formatEstado('2')).toBe('Finalizada'));
  it('undefined → "-"', () => expect(formatEstado(undefined)).toBe('-'));
  it('"texto libre" → "texto libre"', () => expect(formatEstado('otro')).toBe('otro'));
});

describe('getEstadoColor', () => {
  it('"0" → "warning"', () => expect(getEstadoColor('0')).toBe('warning'));
  it('"1" → "info"', () => expect(getEstadoColor('1')).toBe('info'));
  it('"2" → "success"', () => expect(getEstadoColor('2')).toBe('success'));
  it('null → "default"', () => expect(getEstadoColor(null)).toBe('default'));
  it('"Pendiente" → "warning"', () => expect(getEstadoColor('Pendiente')).toBe('warning'));
});
