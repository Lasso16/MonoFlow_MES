import { describe, it, expect } from 'vitest';
import { fmt, fmtDate, operariosDeRegistro, operariosEnMomento } from './reportUtils.shared';

describe('fmt', () => {
  it('0 → "0 min"', () => expect(fmt(0)).toBe('0 min'));
  it('negativo → "0 min"', () => expect(fmt(-10)).toBe('0 min'));
  it('45 → "45min"', () => expect(fmt(45)).toBe('45min'));
  it('90 → "1h 30min"', () => expect(fmt(90)).toBe('1h 30min'));
  it('125 → "2h 5min"', () => expect(fmt(125)).toBe('2h 5min'));
  it('60 → "1h 0min"', () => expect(fmt(60)).toBe('1h 0min'));
});

describe('fmtDate', () => {
  it('undefined → "En curso"', () => expect(fmtDate(undefined)).toBe('En curso'));
  it('ISO válido → string localizado con dígitos', () => {
    const result = fmtDate('2026-01-15T08:30:00Z');
    expect(result).toMatch(/\d/);
    expect(result).not.toBe('En curso');
  });
});

const makeReg = (overrides = {}) =>
  ({
    registroId: 'r1',
    inicio: '2026-01-15T08:00:00Z',
    finalizado: false,
    operarios: [],
    producciones: [],
    incidencias: [],
    rechazos: [],
    ...overrides,
  }) as any;

describe('operariosDeRegistro', () => {
  it('sin operarios → "—"', () => {
    expect(operariosDeRegistro(makeReg())).toBe('—');
  });

  it('operario con número → "Nombre (N)"', () => {
    const reg = makeReg({ operarios: [{ nombreOperario: 'Ana', numeroOperario: 101 }] });
    expect(operariosDeRegistro(reg)).toBe('Ana (101)');
  });

  it('operario sin número → solo nombre', () => {
    const reg = makeReg({ operarios: [{ nombreOperario: 'Luis', numeroOperario: undefined }] });
    expect(operariosDeRegistro(reg)).toBe('Luis');
  });

  it('varios operarios → separados por coma', () => {
    const reg = makeReg({
      operarios: [
        { nombreOperario: 'Ana', numeroOperario: 1 },
        { nombreOperario: 'Luis', numeroOperario: 2 },
      ],
    });
    expect(operariosDeRegistro(reg)).toBe('Ana (1), Luis (2)');
  });
});

describe('operariosEnMomento', () => {
  it('sin operarios → "—"', () => {
    expect(operariosEnMomento(makeReg(), '2026-01-15T09:00:00Z')).toBe('—');
  });

  it('operario activo en el momento → aparece', () => {
    const reg = makeReg({
      operarios: [{ nombreOperario: 'Ana', numeroOperario: 1, inicio: '2026-01-15T08:00:00Z', fin: undefined }],
    });
    expect(operariosEnMomento(reg, '2026-01-15T09:00:00Z')).toBe('Ana (1)');
  });

  it('operario que terminó antes → no aparece', () => {
    const reg = makeReg({
      operarios: [{ nombreOperario: 'Ana', numeroOperario: 1, inicio: '2026-01-15T08:00:00Z', fin: '2026-01-15T08:30:00Z' }],
    });
    expect(operariosEnMomento(reg, '2026-01-15T09:00:00Z')).toBe('—');
  });

  it('operario que aún no llegó → no aparece', () => {
    const reg = makeReg({
      operarios: [{ nombreOperario: 'Ana', numeroOperario: 1, inicio: '2026-01-15T10:00:00Z', fin: undefined }],
    });
    expect(operariosEnMomento(reg, '2026-01-15T09:00:00Z')).toBe('—');
  });
});