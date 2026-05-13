import { describe, it, expect } from 'vitest';
import { buildInformeIncidencias } from './reportUtils.incidencias';

const makeResumen = (detalleRegistros: any[]) =>
  ({
    tipoOperacion: 'Ensamblaje',
    descripcionArticulo: 'Pieza A',
    detalleRegistros,
  }) as any;

const baseReg = {
  registroId: 'r1',
  inicio: '2026-01-15T08:00:00Z',
  finalizado: true,
  operarios: [],
  producciones: [],
  rechazos: [],
};

describe('buildInformeIncidencias', () => {
  it('sin incidencias → mensaje vacío', () => {
    const html = buildInformeIncidencias(makeResumen([{ ...baseReg, incidencias: [] }]), 'now');
    expect(html).toContain('Sin incidencias registradas');
  });

  it('con incidencias → muestra tipo y comentario', () => {
    const reg = {
      ...baseReg,
      incidencias: [
        {
          tipoIncidencia: 'Avería',
          comentario: 'Fallo motor',
          inicio: '2026-01-15T09:00:00Z',
          fin: '2026-01-15T09:30:00Z',
          duracionMinutos: 30,
        },
      ],
    };
    const html = buildInformeIncidencias(makeResumen([reg]), 'now');
    expect(html).toContain('Avería');
    expect(html).toContain('Fallo motor');
  });

  it('total incidencias aparece en subtitle', () => {
    const reg = {
      ...baseReg,
      incidencias: [
        { tipoIncidencia: 'T1', comentario: '', inicio: '2026-01-15T09:00:00Z', duracionMinutos: 10 },
        { tipoIncidencia: 'T2', comentario: '', inicio: '2026-01-15T10:00:00Z', duracionMinutos: 5 },
      ],
    };
    const html = buildInformeIncidencias(makeResumen([reg]), 'now');
    expect(html).toContain('Total incidencias: <strong>2</strong>');
  });
});
