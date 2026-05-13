import { describe, it, expect } from 'vitest';
import {
  mapSesionToOperario,
  requiereConfirmacionAlta,
  computeOperariosActivos,
} from './TeamManagement.utils';

describe('mapSesionToOperario', () => {
  it('mapea campos de sesión a Operario', () => {
    const sesion = { id: 's1', nombre: 'Juan', numeroOperario: 5 } as any;
    const result = mapSesionToOperario(sesion);
    expect(result.id).toBe('s1');
    expect(result.nombre).toBe('Juan');
    expect(result.numeroOperario).toBe(5);
    expect(result.activo).toBe(true);
    expect(result.rol).toBe('Operario');
  });
});

describe('requiereConfirmacionAlta', () => {
  it('estado vacío → true', () => expect(requiereConfirmacionAlta('')).toBe(true));
  it('undefined → true', () => expect(requiereConfirmacionAlta(undefined)).toBe(true));
  it('"En preparación" → false', () => expect(requiereConfirmacionAlta('En preparación')).toBe(false));
  it('"0" (PENDIENTE) → false', () => expect(requiereConfirmacionAlta('0')).toBe(false));
  it('"Detenido" → false', () => expect(requiereConfirmacionAlta('Detenido')).toBe(false));
  it('"Pausado" → false', () => expect(requiereConfirmacionAlta('Pausado')).toBe(false));
  it('"Finalizado" → false', () => expect(requiereConfirmacionAlta('Finalizado')).toBe(false));
  it('"2" (FINALIZADA) → false', () => expect(requiereConfirmacionAlta('2')).toBe(false));
  it('"En ejecución" → true', () => expect(requiereConfirmacionAlta('En ejecución')).toBe(true));
});

const mkOp = (id: string) => ({ id, nombre: `Op${id}`, numeroOperario: 1, activo: true, rol: 'Operario' as const });

describe('computeOperariosActivos', () => {
  it('registroOperarios vacío → usa selectedOperarios filtrado', () => {
    const selected = [mkOp('a'), mkOp('b')];
    const result = computeOperariosActivos([], selected, ['b']);
    expect(result.map((o) => o.id)).toEqual(['a']);
  });

  it('registroOperarios con datos → unión sin duplicados', () => {
    const reg = [mkOp('a'), mkOp('b')];
    const selected = [mkOp('b'), mkOp('c')];
    const result = computeOperariosActivos(reg, selected, []);
    expect(result.map((o) => o.id)).toEqual(['a', 'b', 'c']);
  });

  it('hiddenOperarioIds filtra de registro y selected', () => {
    const reg = [mkOp('a'), mkOp('b')];
    const selected = [mkOp('c')];
    const result = computeOperariosActivos(reg, selected, ['b']);
    expect(result.map((o) => o.id)).toEqual(['a', 'c']);
  });

  it('undefined registroOperarios → usa selectedOperarios', () => {
    const selected = [mkOp('x')];
    const result = computeOperariosActivos(undefined, selected, []);
    expect(result.map((o) => o.id)).toEqual(['x']);
  });
});
