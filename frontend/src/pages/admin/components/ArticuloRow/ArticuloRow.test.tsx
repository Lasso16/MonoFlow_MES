import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArticuloRow } from './ArticuloRow';
import { Table, TableBody } from '@mui/material';

vi.mock('../../../../hooks/queries/useOperacionesQueries', () => ({
  useGetOperacionesArticulo: vi.fn(),
}));

vi.mock('../../../../utils/estadoArticulosUtils', () => ({
  getEstadoKind: vi.fn(() => 'enejecucion'),
  getEstadoLabel: vi.fn(() => 'En curso'),
}));

vi.mock('../../utils/adminPlantStatusUtils', () => ({
  getEstadoColor: vi.fn(() => 'info'),
  getProgresoLabel: vi.fn(() => '50.00% (5/10)'),
}));

import { useGetOperacionesArticulo } from '../../../../hooks/queries/useOperacionesQueries';

const makeArticulo = () => ({
  id: 'ART-1',
  referencia: 'REF-001',
  descripcion: 'Silla de madera',
  linea: 3,
  cantidad: 20,
  estado: '1',
} as any);

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Table>
    <TableBody>{children}</TableBody>
  </Table>
);

describe('Componente: ArticuloRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetOperacionesArticulo).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
  });

  it('Renderiza referencia, descripcion, linea y cantidad', () => {
    render(
      <Wrapper>
        <ArticuloRow articulo={makeArticulo()} onSelectOperacion={vi.fn()} />
      </Wrapper>,
    );

    expect(screen.getByText('REF-001')).toBeInTheDocument();
    expect(screen.getByText('Silla de madera')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('Panel de operaciones no existe en DOM antes de expandir', () => {
    render(
      <Wrapper>
        <ArticuloRow articulo={makeArticulo()} onSelectOperacion={vi.fn()} />
      </Wrapper>,
    );

    expect(screen.queryByText('Operaciones del artículo')).not.toBeInTheDocument();
  });

  it('Clic en fila expande y muestra operaciones', async () => {
    const user = userEvent.setup();
    const operaciones = [
      { id: 'OP-1', tipoOperacion: 'Montaje', estado: '1', cantidadTotal: 10, cantidadProducida: 5, cantidadRechazada: 0, progreso: 50 },
    ];
    vi.mocked(useGetOperacionesArticulo).mockReturnValue({
      data: operaciones,
      isLoading: false,
    } as any);

    render(
      <Wrapper>
        <ArticuloRow articulo={makeArticulo()} onSelectOperacion={vi.fn()} />
      </Wrapper>,
    );

    await user.click(screen.getByText('REF-001'));

    expect(screen.getByText('Operaciones del artículo')).toBeVisible();
    expect(screen.getByText('Montaje')).toBeInTheDocument();
  });

  it('Muestra spinner mientras carga operaciones', async () => {
    const user = userEvent.setup();
    vi.mocked(useGetOperacionesArticulo).mockReturnValue({
      data: [],
      isLoading: true,
    } as any);

    render(
      <Wrapper>
        <ArticuloRow articulo={makeArticulo()} onSelectOperacion={vi.fn()} />
      </Wrapper>,
    );

    await user.click(screen.getByText('REF-001'));

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('Clic en operación llama onSelectOperacion con id y tipo', async () => {
    const user = userEvent.setup();
    const onSelectOperacion = vi.fn();
    const operaciones = [
      { id: 'OP-1', tipoOperacion: 'Ensamblaje', estado: '1', cantidadTotal: 10, cantidadProducida: 5, cantidadRechazada: 0, progreso: 50 },
    ];
    vi.mocked(useGetOperacionesArticulo).mockReturnValue({
      data: operaciones,
      isLoading: false,
    } as any);

    render(
      <Wrapper>
        <ArticuloRow articulo={makeArticulo()} onSelectOperacion={onSelectOperacion} />
      </Wrapper>,
    );

    await user.click(screen.getByText('REF-001'));
    await user.click(screen.getByText('Ensamblaje'));

    expect(onSelectOperacion).toHaveBeenCalledWith('OP-1', 'Ensamblaje');
  });

  it('Descripción undefined muestra guion', () => {
    const articulo = { ...makeArticulo(), descripcion: undefined };
    render(
      <Wrapper>
        <ArticuloRow articulo={articulo} onSelectOperacion={vi.fn()} />
      </Wrapper>,
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
