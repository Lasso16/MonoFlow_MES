import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ArticuloResponse } from '../../../../model/aggregates/Articulos';
import type { OperacionResponse } from '../../../../model/aggregates/Operaciones';
import { useGetOperacionesArticulo } from '../../../../hooks/queries/useOperacionesQueries';
import { ArticuloAccordion } from './ArticuloAccordion';

vi.mock('../../../../hooks/queries/useOperacionesQueries', () => ({
  useGetOperacionesArticulo: vi.fn(),
}));

describe('Componente: ArticuloAccordion', () => {
  const invalidateQueries = vi.fn();
  const refetchOperaciones = vi.fn();

  const baseArticulo = {
    id: 'ART-1',
    referencia: 'REF-001',
    descripcion: 'Chapa',
    linea: 1,
    cantidad: 100,
    estado: '1',
    cantidadOperaciones: 2,
  } as ArticuloResponse;

  const operaciones = [
    {
      id: 'OP-1',
      idArticulo: 'ART-1',
      idTipoOperacion: 1,
      tipoOperacion: 'Corte',
      cantidadTotal: 10,
      cantidadProducida: 3,
      cantidadRechazada: 0,
      tiempoTotal: 0,
      ultimaOperacion: true,
      progreso: 30,
      estado: '1',
    },
  ] as OperacionResponse[];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useGetOperacionesArticulo).mockReturnValue({
      data: operaciones,
      isLoading: false,
      isError: false,
      refetch: refetchOperaciones,
    } as any);
  });

  it('muestra el resumen del artículo', () => {
    render(
      <ArticuloAccordion
        articulo={baseArticulo}
        queryClient={{ invalidateQueries } as any}
      />,
    );

    expect(screen.getByText('REF-001 - Chapa')).toBeInTheDocument();
    expect(screen.getByText('En curso')).toBeInTheDocument();
    expect(screen.getByText('2 operaciones')).toBeInTheDocument();
  });

  it('al expandirse carga operaciones y permite seleccionar una', async () => {
    const user = userEvent.setup();
    const onSelectOperacion = vi.fn();

    render(
      <ArticuloAccordion
        articulo={baseArticulo}
        onSelectOperacion={onSelectOperacion}
        queryClient={{ invalidateQueries } as any}
      />,
    );

    await user.click(screen.getByRole('button', { name: /ref-001 - chapa/i }));

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['operaciones-articulo', 'ART-1'],
    });
    expect(refetchOperaciones).toHaveBeenCalled();
    expect(await screen.findByText('Corte')).toBeInTheDocument();
    expect(screen.getByText(/Progreso: 30\.00% 3\/10/i)).toBeInTheDocument();

    await user.click(screen.getByText('Corte'));

    expect(onSelectOperacion).toHaveBeenCalledWith('OP-1');
    expect(invalidateQueries).toHaveBeenCalledTimes(2);
  });
});