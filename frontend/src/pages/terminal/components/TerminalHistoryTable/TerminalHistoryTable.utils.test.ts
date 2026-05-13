import { describe, it, expect } from 'vitest';
import {
  pickText,
  getStringField,
  toNumber,
  formatHora,
  getSortTime,
  formatDuracion,
  parseDateTime,
  getEventoColor,
} from './TerminalHistoryTable.utils';

describe('pickText', () => {
  it('primer valor no vacío', () => expect(pickText(null, undefined, 'hola')).toBe('hola'));
  it('primer valor con espacios saltado', () => expect(pickText('  ', 'ok')).toBe('ok'));
  it('todos vacíos → undefined', () => expect(pickText(null, undefined, '')).toBeUndefined());
  it('sin argumentos → undefined', () => expect(pickText()).toBeUndefined());
});

describe('getStringField', () => {
  it('encuentra campo directo', () => {
    expect(getStringField({ nombre: 'Ana' }, ['nombre'])).toBe('Ana');
  });

  it('busca case-insensitive si no encuentra directo', () => {
    expect(getStringField({ Nombre: 'Ana' }, ['nombre'])).toBe('Ana');
  });

  it('campo vacío ignorado', () => {
    expect(getStringField({ a: '', b: 'ok' }, ['a', 'b'])).toBe('ok');
  });

  it('nada encontrado → undefined', () => {
    expect(getStringField({ x: 'val' }, ['a', 'b'])).toBeUndefined();
  });
});

describe('toNumber', () => {
  it('número finito → mismo número', () => expect(toNumber(42)).toBe(42));
  it('NaN → undefined', () => expect(toNumber(NaN)).toBeUndefined());
  it('string numérico → número', () => expect(toNumber('3.14')).toBeCloseTo(3.14));
  it('string no numérico → undefined', () => expect(toNumber('abc')).toBeUndefined());
  it('undefined → undefined', () => expect(toNumber(undefined)).toBeUndefined());
});

describe('formatHora', () => {
  it('undefined → "-"', () => expect(formatHora(undefined)).toBe('-'));
  it('string inválido → "-"', () => expect(formatHora('nope')).toBe('-'));
  it('ISO válido → HH:MM:SS', () => {
    const result = formatHora('2026-01-15T10:30:45Z');
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});

describe('getSortTime', () => {
  it('undefined → 0', () => expect(getSortTime(undefined)).toBe(0));
  it('string inválido → 0', () => expect(getSortTime('nope')).toBe(0));
  it('ISO válido → timestamp', () => {
    expect(getSortTime('2026-01-15T10:00:00Z')).toBeGreaterThan(0);
  });
});

describe('formatDuracion', () => {
  it('undefined → "-"', () => expect(formatDuracion(undefined)).toBe('-'));
  it('0 → "-"', () => expect(formatDuracion(0)).toBe('-'));
  it('negativo → "-"', () => expect(formatDuracion(-1000)).toBe('-'));
  it('3661000ms → "01:01:01"', () => expect(formatDuracion(3661000)).toBe('01:01:01'));
  it('60000ms → "00:01:00"', () => expect(formatDuracion(60000)).toBe('00:01:00'));
});

describe('parseDateTime', () => {
  it('undefined → undefined', () => expect(parseDateTime(undefined)).toBeUndefined());
  it('string inválido → undefined', () => expect(parseDateTime('nope')).toBeUndefined());
  it('ISO válido → timestamp', () => {
    expect(parseDateTime('2026-01-15T10:00:00Z')).toBeGreaterThan(0);
  });
});

describe('getEventoColor', () => {
  it('"Pendiente" → pendiente', () => expect(getEventoColor('Pendiente')).toBe('pendiente'));
  it('"En preparación" → enpreparacion', () => expect(getEventoColor('En preparación')).toBe('enpreparacion'));
  it('"En ejecución" → enejecucion', () => expect(getEventoColor('En ejecución')).toBe('enejecucion'));
  it('"En recogida" → enrecogida', () => expect(getEventoColor('En recogida')).toBe('enrecogida'));
  it('"Finalizado" → finproduccion', () => expect(getEventoColor('Finalizado')).toBe('finproduccion'));
  it('"Incidencia" → incidentado', () => expect(getEventoColor('Incidencia')).toBe('incidentado'));
  it('"Pausado" → pausado', () => expect(getEventoColor('Pausado')).toBe('pausado'));
  it('"Detenido" → detenido', () => expect(getEventoColor('Detenido')).toBe('detenido'));
  it('"desconocido_tipo" → desconocido', () => expect(getEventoColor('xyz123')).toBe('desconocido'));
});
