import { describe, it, expect } from 'vitest';
import { getEstadoColor, formatDateTime, getProgresoLabel } from './adminPlantStatusUtils';

describe('getEstadoColor', () => {
  it('pendiente → "warning"', () => expect(getEstadoColor('pendiente')).toBe('warning'));
  it('enejecucion → "info"', () => expect(getEstadoColor('enejecucion')).toBe('info'));
  it('enrecogida → "info"', () => expect(getEstadoColor('enrecogida')).toBe('info'));
  it('enpreparacion → "info"', () => expect(getEstadoColor('enpreparacion')).toBe('info'));
  it('finproduccion → "success"', () => expect(getEstadoColor('finproduccion')).toBe('success'));
  it('incidentado → "error"', () => expect(getEstadoColor('incidentado')).toBe('error'));
  it('pausado → "warning"', () => expect(getEstadoColor('pausado')).toBe('warning'));
  it('detenido → "warning"', () => expect(getEstadoColor('detenido')).toBe('warning'));
  it('desconocido → "default"', () => expect(getEstadoColor('desconocido')).toBe('default'));
});

describe('formatDateTime', () => {
  it('undefined → "-"', () => expect(formatDateTime(undefined)).toBe('-'));
  it('string vacío → "-"', () => expect(formatDateTime('')).toBe('-'));
  it('ISO válido → string con fecha y hora', () => {
    const result = formatDateTime('2026-03-15T09:00:00Z');
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
  });
  it('string inválido → devuelve valor original', () => {
    expect(formatDateTime('invalido')).toBe('invalido');
  });
});

describe('getProgresoLabel', () => {
  it('progreso finito usa operacion.progreso', () => {
    const op = { cantidadTotal: 10, cantidadProducida: 5, cantidadRechazada: 1, progreso: 75 } as any;
    expect(getProgresoLabel(op)).toBe('75.00% (6/10)');
  });

  it('progreso no finito calcula desde cantidades', () => {
    const op = { cantidadTotal: 10, cantidadProducida: 4, cantidadRechazada: 2, progreso: undefined } as any;
    expect(getProgresoLabel(op)).toBe('60.00% (6/10)');
  });

  it('total 0 → porcentaje 0', () => {
    const op = { cantidadTotal: 0, cantidadProducida: 0, cantidadRechazada: 0, progreso: undefined } as any;
    expect(getProgresoLabel(op)).toBe('0.00% (0/0)');
  });

  it('cantidades undefined → tratan como 0', () => {
    const op = { cantidadTotal: 5, progreso: undefined } as any;
    expect(getProgresoLabel(op)).toBe('0.00% (0/5)');
  });
});
