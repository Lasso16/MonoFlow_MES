import { describe, it, expect } from 'vitest';
import { buildInformeHtml } from './reportUtils';

const orden = {
  id: 'o1',
  idNavision: 'NAV-XYZ',
  descripcion: 'Test orden',
  cliente: 'Cliente Test',
  estado: '1',
} as any;

const resumen = {
  operacionId: 'op1',
  cliente: 'Cliente Test',
  descripcionArticulo: 'Articulo Test',
  cantidadTotal: 50,
  tipoOperacion: 'Fresado',
  tiempoTotal: 120,
  tiempoPlanificado: 100,
  tiempoEfectivo: 90,
  tiempoPausa: 15,
  tiempoIncidencia: 5,
  tiempoPreparacion: 10,
  tiempoRecogida: 5,
  unidadesFabricadas: 45,
  tiempoTrabajo: 100,
  detalleRegistros: [],
} as any;

describe('buildInformeHtml', () => {
  it('produce HTML válido con DOCTYPE', () => {
    const html = buildInformeHtml(orden, resumen);
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('incluye idNavision de la orden', () => {
    const html = buildInformeHtml(orden, resumen);
    expect(html).toContain('NAV-XYZ');
  });

  it('incluye tipoOperacion', () => {
    const html = buildInformeHtml(orden, resumen);
    expect(html).toContain('Fresado');
  });

  it('incluye secciones de incidencias y rechazos', () => {
    const html = buildInformeHtml(orden, resumen);
    expect(html).toContain('Incidencias');
    expect(html).toContain('Rechazos');
  });

  it('incluye script window.print()', () => {
    const html = buildInformeHtml(orden, resumen);
    expect(html).toContain('window.print()');
  });
});
