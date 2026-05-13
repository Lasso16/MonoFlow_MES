import { describe, it, expect } from 'vitest';
import {
  formatDateTime,
  extractSesionesActivas,
  toArray,
  pickArray,
  pickText,
  pickNumber,
} from './adminOperacionUtils';

describe('formatDateTime', () => {
  it('null → "-"', () => expect(formatDateTime(null)).toBe('-'));
  it('undefined → "-"', () => expect(formatDateTime(undefined)).toBe('-'));
  it('string vacío → "-"', () => expect(formatDateTime('')).toBe('-'));
  it('ISO válido → string formateado', () => {
    const result = formatDateTime('2026-01-15T10:30:00Z');
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
  });
  it('string no fecha → devuelve el valor original', () => {
    expect(formatDateTime('no-es-fecha')).toBe('no-es-fecha');
  });
});

describe('extractSesionesActivas', () => {
  it('no objeto → []', () => expect(extractSesionesActivas('texto')).toEqual([]));
  it('null → []', () => expect(extractSesionesActivas(null)).toEqual([]));
  it('extrae sesiones con operario anidado', () => {
    expect(
      extractSesionesActivas({
        sesionesActivas: [
          {
            id: 's1',
            inicio: '2026-01-15T08:00:00Z',
            fin: null,
            operario: {
              id: 'op1',
              numeroOperario: 101,
              nombre: 'Juan García',
            },
          },
        ],
      }),
    ).toEqual([
      {
        id: 's1',
        operarioId: 'op1',
        numeroOperario: '101',
        nombre: 'Juan García',
        inicio: '2026-01-15T08:00:00Z',
        fin: null,
      },
    ]);
  });
  it('lee operarios como fallback', () => {
    expect(
      extractSesionesActivas({
        operarios: [
          {
            id: 'op2',
            numeroOperario: '102',
            nombre: 'Ana López',
            inicio: '2026-01-15T09:00:00Z',
            fin: '2026-01-15T10:00:00Z',
          },
        ],
      }),
    ).toMatchObject([
      {
        id: 'op2',
        operarioId: 'op2',
        numeroOperario: '102',
        nombre: 'Ana López',
        inicio: '2026-01-15T09:00:00Z',
        fin: '2026-01-15T10:00:00Z',
      },
    ]);
  });
  it('no array → []', () => {
    expect(extractSesionesActivas({ sesionesActivas: 'nope' })).toEqual([]);
  });
});

describe('toArray', () => {
  it('array → mismo array', () => {
    const a = [1, 2];
    expect(toArray(a)).toBe(a);
  });
  it('objeto con $values → $values', () => {
    const v = [1, 2, 3];
    expect(toArray({ $values: v })).toBe(v);
  });
  it('objeto sin $values → []', () => {
    expect(toArray({ foo: 'bar' })).toEqual([]);
  });
  it('null → []', () => expect(toArray(null)).toEqual([]));
  it('string → []', () => expect(toArray('x')).toEqual([]));
});

describe('pickArray', () => {
  it('no objeto → []', () => expect(pickArray(null, ['a'])).toEqual([]));
  it('primera clave con array → devuelve ese array', () => {
    const a = [1, 2];
    expect(pickArray({ a, b: [3] }, ['a', 'b'])).toEqual(a);
  });
  it('primera clave vacía (array vacío) → devuelve ese array vacío', () => {
    expect(pickArray({ a: [], b: [3, 4] }, ['a', 'b'])).toEqual([]);
  });
  it('ninguna clave con datos → []', () => {
    expect(pickArray({ a: [], b: [] }, ['a', 'b'])).toEqual([]);
  });
  it('valor $values en primera clave', () => {
    const v = [5];
    expect(pickArray({ a: { $values: v } }, ['a'])).toEqual(v);
  });
});

describe('pickText', () => {
  it('no objeto → fallback', () => expect(pickText(null, ['a'])).toBe('-'));
  it('primera clave con string → valor', () => {
    expect(pickText({ a: 'hola', b: 'mundo' }, ['a', 'b'])).toBe('hola');
  });
  it('primera clave vacía, segunda con valor', () => {
    expect(pickText({ a: '  ', b: 'ok' }, ['a', 'b'])).toBe('ok');
  });
  it('número → string del número', () => {
    expect(pickText({ a: 42 }, ['a'])).toBe('42');
  });
  it('ninguna clave con valor → fallback personalizado', () => {
    expect(pickText({ a: '' }, ['a'], 'N/A')).toBe('N/A');
  });
});

describe('pickNumber', () => {
  it('no objeto → fallback', () => expect(pickNumber(null, ['a'])).toBe(0));
  it('primera clave con número finito', () => {
    expect(pickNumber({ a: 7, b: 8 }, ['a', 'b'])).toBe(7);
  });
  it('primera clave NaN, segunda válida', () => {
    expect(pickNumber({ a: NaN, b: 5 }, ['a', 'b'])).toBe(5);
  });
  it('string numérico → número', () => {
    expect(pickNumber({ a: '3.14' }, ['a'])).toBeCloseTo(3.14);
  });
  it('sin clave válida → fallback personalizado', () => {
    expect(pickNumber({ a: 'nope' }, ['a'], 99)).toBe(99);
  });
});
