import { describe, it, expect } from 'vitest';
import { buildInformeRechazos } from './reportUtils.rechazos';

const makeResumen = (detalleRegistros: any[]) =>
  ({
    tipoOperacion: 'Soldadura',
    descripcionArticulo: 'Pieza B',
    detalleRegistros,
  }) as any;

const baseReg = {
  registroId: 'r1',
  inicio: '2026-01-15T08:00:00Z',
  finalizado: true,
  operarios: [],
  producciones: [],
  incidencias: [],
};

describe('buildInformeRechazos', () => {
  it('sin rechazos → mensaje vacío', () => {
    const html = buildInformeRechazos(makeResumen([{ ...baseReg, rechazos: [] }]), 'now');
    expect(html).toContain('Sin rechazos registrados');
  });

  it('con rechazos → muestra tipo y cantidad', () => {
    const reg = {
      ...baseReg,
      rechazos: [{ tipo: 'Grieta', cantidad: 3, comentario: 'Visible', timestamp: '2026-01-15T09:00:00Z' }],
    };
    const html = buildInformeRechazos(makeResumen([reg]), 'now');
    expect(html).toContain('Grieta');
    expect(html).toContain('3');
  });

  it('total unidades rechazadas en subtitle', () => {
    const reg = {
      ...baseReg,
      rechazos: [
        { tipo: 'A', cantidad: 2, comentario: '', timestamp: '2026-01-15T09:00:00Z' },
        { tipo: 'B', cantidad: 4, comentario: '', timestamp: '2026-01-15T10:00:00Z' },
      ],
    };
    const html = buildInformeRechazos(makeResumen([reg]), 'now');
    expect(html).toContain('Total unidades rechazadas: <strong>6</strong>');
  });
});
