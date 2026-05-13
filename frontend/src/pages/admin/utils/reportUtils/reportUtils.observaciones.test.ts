import { describe, it, expect } from 'vitest';
import { buildInformeObservaciones } from './reportUtils.observaciones';

const makeResumen = (detalleRegistros: any[]) =>
  ({
    tipoOperacion: 'Pintura',
    descripcionArticulo: 'Panel C',
    detalleRegistros,
  }) as any;

const baseReg = {
  registroId: 'r1',
  inicio: '2026-01-15T08:00:00Z',
  finalizado: true,
  operarios: [],
  producciones: [],
  incidencias: [],
  rechazos: [],
};

describe('buildInformeObservaciones', () => {
  it('sin observaciones → mensaje vacío', () => {
    const html = buildInformeObservaciones(makeResumen([{ ...baseReg, observaciones: undefined }]), 'now');
    expect(html).toContain('Sin observaciones registradas');
  });

  it('observación en blanco → mensaje vacío', () => {
    const html = buildInformeObservaciones(makeResumen([{ ...baseReg, observaciones: '   ' }]), 'now');
    expect(html).toContain('Sin observaciones registradas');
  });

  it('con observaciones → muestra texto en lista', () => {
    const reg = { ...baseReg, observaciones: 'Línea 1\nLínea 2' };
    const html = buildInformeObservaciones(makeResumen([reg]), 'now');
    expect(html).toContain('Línea 1');
    expect(html).toContain('Línea 2');
  });

  it('conteo total de observaciones en subtitle', () => {
    const reg = { ...baseReg, observaciones: 'obs1\nobs2\nobs3' };
    const html = buildInformeObservaciones(makeResumen([reg]), 'now');
    expect(html).toContain('Total observaciones: <strong>3</strong>');
  });
});
