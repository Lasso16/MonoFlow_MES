import { describe, it, expect } from 'vitest';
import { getCantidadOperacionesArticulo, getProgresoLabel } from './ProjectScopeUtils';

describe('getCantidadOperacionesArticulo', () => {
  it('usa cantidadOperaciones si es número finito', () => {
    const art = { cantidadOperaciones: 5 } as any;
    expect(getCantidadOperacionesArticulo(art, 10)).toBe(5);
  });

  it('usa CantidadOperaciones (pascal) si cantidadOperaciones ausente', () => {
    const art = { CantidadOperaciones: 7 } as any;
    expect(getCantidadOperacionesArticulo(art, 10)).toBe(7);
  });

  it('fallback si raw no es número', () => {
    const art = { cantidadOperaciones: undefined } as any;
    expect(getCantidadOperacionesArticulo(art, 3)).toBe(3);
  });

  it('fallback si raw no es finito (NaN)', () => {
    const art = { cantidadOperaciones: NaN } as any;
    expect(getCantidadOperacionesArticulo(art, 4)).toBe(4);
  });
});

describe('getProgresoLabel', () => {
  it('progreso finito → usa operacion.progreso', () => {
    const op = { cantidadTotal: 10, cantidadProducida: 5, cantidadRechazada: 0, progreso: 80 } as any;
    expect(getProgresoLabel(op)).toBe('80.00% 5/10');
  });

  it('progreso undefined → calcula desde cantidades', () => {
    const op = { cantidadTotal: 10, cantidadProducida: 4, cantidadRechazada: 2, progreso: undefined } as any;
    expect(getProgresoLabel(op)).toBe('60.00% 6/10');
  });

  it('total 0 → porcentaje 0', () => {
    const op = { cantidadTotal: 0, cantidadProducida: 0, cantidadRechazada: 0, progreso: undefined } as any;
    expect(getProgresoLabel(op)).toBe('0.00% 0/0');
  });
});
