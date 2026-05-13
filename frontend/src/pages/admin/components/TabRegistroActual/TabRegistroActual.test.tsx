import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TabRegistroActual } from './TabRegistroActual';

vi.mock('../../../../hooks/queries/useRegistroTrabajoQueries', () => ({
  useRegistroTrabajoMutations: () => ({
    finalizarRegistroTrabajoMutation: {
      isPending: false,
      mutate: vi.fn(),
    },
  }),
}));

const emptyProps = {
  registroActual: undefined,
  sesionesActivas: [],
  isRegistroActualLoading: false,
  isRegistroActualFetching: false,
  incidenciasParosRegistroActual: [],
  rechazosRegistroActual: [],
};

describe('Componente: TabRegistroActual', () => {
  it('Muestra spinner cuando isRegistroActualLoading=true', () => {
    render(<TabRegistroActual {...emptyProps} isRegistroActualLoading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('Muestra spinner cuando isFetching=true y sin registro', () => {
    render(
      <TabRegistroActual
        {...emptyProps}
        isRegistroActualFetching={true}
        registroActual={undefined}
      />,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('Muestra mensaje sin registro cuando registroActual=undefined', () => {
    render(<TabRegistroActual {...emptyProps} />);

    expect(screen.getByText('No hay registro abierto actualmente.')).toBeInTheDocument();
  });

  it('Muestra datos del registro: inicio, producido, rechazado', () => {
    const registroActual = {
      inicio: '2026-01-15T08:00:00Z',
      totalProducidoOk: 42,
      totalRechazado: 3,
    } as any;
    render(<TabRegistroActual {...emptyProps} registroActual={registroActual} />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Abierto desde')).toBeInTheDocument();
  });

  it('Muestra sesiones activas en la tabla de equipo', () => {
    const registroActual = { inicio: '2026-01-15T08:00:00Z' } as any;
    const sesionesActivas = [
      { id: 's1', numeroOperario: '101', nombre: 'Juan García' },
      { id: 's2', numeroOperario: '102', nombre: 'Ana López' },
    ] as any;
    render(
      <TabRegistroActual
        {...emptyProps}
        registroActual={registroActual}
        sesionesActivas={sesionesActivas}
      />,
    );

    expect(screen.getByText('Juan García')).toBeInTheDocument();
    expect(screen.getByText('Ana López')).toBeInTheDocument();
    expect(screen.getByText('101')).toBeInTheDocument();
  });

  it('Muestra mensaje sin incidencias cuando lista vacía', () => {
    render(
      <TabRegistroActual
        {...emptyProps}
        registroActual={{ inicio: '2026-01-15T08:00:00Z' } as any}
      />,
    );

    expect(
      screen.getByText('Sin incidencias registradas en el registro actual.'),
    ).toBeInTheDocument();
  });

  it('Muestra incidencias en la tabla', () => {
    const registroActual = { inicio: '2026-01-15T08:00:00Z' } as any;
    const incidencias = [
      {
        key: 'inc-0',
        tipo: 'Averia maquina',
        inicio: '2026-01-15T09:00:00Z',
        fin: '2026-01-15T10:00:00Z',
        comentario: 'Roto el eje',
      },
    ];
    render(
      <TabRegistroActual
        {...emptyProps}
        registroActual={registroActual}
        incidenciasParosRegistroActual={incidencias}
      />,
    );

    expect(screen.getByText('Averia maquina')).toBeInTheDocument();
    expect(screen.getByText('Roto el eje')).toBeInTheDocument();
  });

  it('Muestra mensaje sin rechazos cuando lista vacía', () => {
    render(
      <TabRegistroActual
        {...emptyProps}
        registroActual={{ inicio: '2026-01-15T08:00:00Z' } as any}
      />,
    );

    expect(
      screen.getByText('Sin rechazos registrados en el registro actual.'),
    ).toBeInTheDocument();
  });

  it('Muestra rechazos en la tabla', () => {
    const registroActual = { inicio: '2026-01-15T08:00:00Z' } as any;
    const rechazos = [
      { tipo: 'Roto', cantidad: 5, timestamp: '2026-01-15T09:30:00Z', comentario: 'Grieta' },
    ];
    render(
      <TabRegistroActual
        {...emptyProps}
        registroActual={registroActual}
        rechazosRegistroActual={rechazos}
      />,
    );

    expect(screen.getByText('Roto')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Grieta')).toBeInTheDocument();
  });
});
