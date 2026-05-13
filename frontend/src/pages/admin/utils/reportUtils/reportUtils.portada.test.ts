import { describe, it, expect } from 'vitest';
import { buildInformePortada } from './reportUtils.portada';

const orden = {
  id: 'o1',
  idNavision: 'NAV-001',
  descripcion: 'Descripción orden',
  cliente: 'Cliente A',
  estado: '1',
} as any;

const makeResumen = (overrides = {}) =>
  ({
    operacionId: 'op1',
    cliente: 'Cliente A',
    descripcionArticulo: 'Articulo X',
    cantidadTotal: 100,
    tipoOperacion: 'Montaje',
    tiempoTotal: 90,
    tiempoPlanificado: 80,
    tiempoEfectivo: 60,
    tiempoPausa: 10,
    tiempoIncidencia: 5,
    tiempoPreparacion: 10,
    tiempoRecogida: 5,
    unidadesFabricadas: 80,
    tiempoTrabajo: 70,
    detalleRegistros: [
      {
        registroId: 'r1',
        inicio: '2026-01-15T08:00:00Z',
        finalizado: true,
        operarios: [],
        producciones: [{ cantidadOk: 40 }, { cantidadOk: 20 }],
        incidencias: [],
        rechazos: [],
      },
    ],
    ...overrides,
  }) as any;

describe('buildInformePortada', () => {
  it('incluye idNavision de la orden', () => {
    const html = buildInformePortada(orden, makeResumen(), '15/01/2026');
    expect(html).toContain('NAV-001');
  });

  it('incluye tipoOperacion', () => {
    const html = buildInformePortada(orden, makeResumen(), '15/01/2026');
    expect(html).toContain('Montaje');
  });

  it('suma producciones correctamente', () => {
    const html = buildInformePortada(orden, makeResumen(), '15/01/2026');
    expect(html).toContain('60');
  });

  it('sin registros → totalProducido 0', () => {
    const resumen = makeResumen({ detalleRegistros: [] });
    const html = buildInformePortada(orden, resumen, 'now');
    expect(html).toContain('0');
  });

  it('tiempoPlanificado null → muestra "—" en diferencia', () => {
    const resumen = makeResumen({ tiempoPlanificado: null });
    const html = buildInformePortada(orden, resumen, 'now');
    expect(html).toContain('—');
  });
});
