import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { TabHistorial } from './TabHistorial';

const emptyProps = {
  historialRegistros: [],
  resumenRoot: undefined,
  isResumenLoading: false,
};

describe('Componente: TabHistorial', () => {
  it('Muestra spinner cuando isResumenLoading=true', () => {
    render(<TabHistorial {...emptyProps} isResumenLoading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('Muestra mensaje sin historial cuando lista vacía', () => {
    render(<TabHistorial {...emptyProps} />);

    expect(screen.getByText('No hay historial disponible.')).toBeInTheDocument();
  });

  it('Renderiza un acordeón por registro', () => {
    const historialRegistros = [
      { id: 'R1', inicio: '2026-01-10T08:00:00Z', fin: '2026-01-10T16:00:00Z' },
      { id: 'R2', inicio: '2026-01-11T08:00:00Z', fin: '2026-01-11T16:00:00Z' },
    ];
    render(<TabHistorial {...emptyProps} historialRegistros={historialRegistros} />);

    const summaries = screen.getAllByRole('button');
    expect(summaries.length).toBeGreaterThanOrEqual(2);
  });

  it('Registro sin fin muestra "En curso"', () => {
    const historialRegistros = [
      { id: 'R1', inicio: '2026-01-10T08:00:00Z' },
    ];
    render(<TabHistorial {...emptyProps} historialRegistros={historialRegistros} />);

    expect(screen.getByText(/En curso/)).toBeInTheDocument();
  });

  it('Expandir acordeón muestra secciones de Personal, Incidencias y Rechazos', async () => {
    const user = userEvent.setup();
    const historialRegistros = [
      {
        id: 'R1',
        inicio: '2026-01-10T08:00:00Z',
        fin: '2026-01-10T16:00:00Z',
        operarios: [],
        incidencias: [],
        rechazos: [],
      },
    ];
    render(<TabHistorial {...emptyProps} historialRegistros={historialRegistros} />);

    await user.click(screen.getByRole('button'));

    expect(await screen.findByText(/Personal del Turno/i)).toBeInTheDocument();
    expect(await screen.findByText(/Registro de Rechazos/i)).toBeInTheDocument();
  });

  it('Sin incidencias muestra mensaje vacío al expandir', async () => {
    const user = userEvent.setup();
    const historialRegistros = [
      { id: 'R1', inicio: '2026-01-10T08:00:00Z', incidencias: [], rechazos: [] },
    ];
    render(<TabHistorial {...emptyProps} historialRegistros={historialRegistros} />);

    await user.click(screen.getByRole('button'));

    expect(
      await screen.findByText('Sin incidencias registradas en este turno.'),
    ).toBeInTheDocument();
  });

  it('Sin rechazos muestra mensaje vacío al expandir', async () => {
    const user = userEvent.setup();
    const historialRegistros = [
      { id: 'R1', inicio: '2026-01-10T08:00:00Z', incidencias: [], rechazos: [] },
    ];
    render(<TabHistorial {...emptyProps} historialRegistros={historialRegistros} />);

    await user.click(screen.getByRole('button'));

    expect(await screen.findByText('Sin rechazos registrados.')).toBeInTheDocument();
  });

  it('Muestra incidencias del registro al expandir', async () => {
    const user = userEvent.setup();
    const historialRegistros = [
      {
        id: 'R1',
        inicio: '2026-01-10T08:00:00Z',
        incidencias: [
          {
            nombreTipoIncidencia: 'Falta material',
            inicio: '2026-01-10T09:00:00Z',
            comentario: 'Sin stock',
          },
        ],
        rechazos: [],
      },
    ];
    render(<TabHistorial {...emptyProps} historialRegistros={historialRegistros} />);

    await user.click(screen.getByRole('button'));

    expect(await screen.findByText('Falta material')).toBeInTheDocument();
    expect(await screen.findByText('Sin stock')).toBeInTheDocument();
  });

  it('Muestra rechazos del registro al expandir', async () => {
    const user = userEvent.setup();
    const historialRegistros = [
      {
        id: 'R1',
        inicio: '2026-01-10T08:00:00Z',
        incidencias: [],
        rechazos: [{ tipo: 'Roto', cantidad: 3, timestamp: '2026-01-10T10:00:00Z', comentario: 'Grieta' }],
      },
    ];
    render(<TabHistorial {...emptyProps} historialRegistros={historialRegistros} />);

    await user.click(screen.getByRole('button'));

    expect(await screen.findByText('Roto')).toBeInTheDocument();
    expect(await screen.findByText('3')).toBeInTheDocument();
    expect(await screen.findByText('Grieta')).toBeInTheDocument();
  });
});
