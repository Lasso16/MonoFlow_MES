import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OperationSelectorCard } from './OperationSelectorCard';
import { useGetArticulos } from '../../../../hooks/queries/useArticulosQueries';

vi.mock('../../../../hooks/queries/useArticulosQueries', () => ({
  useGetArticulos: vi.fn(),
}));

vi.mock('../../../../utils/estadoArticulosUtils', () => ({
  isArticuloVisible: vi.fn(() => true), // Siempre visible para el test
}));

vi.mock('./ArticuloAccordion', () => ({
  ArticuloAccordion: ({ articulo, onSelectOperacion }: any) => (
    <button 
      data-testid={`mock-articulo-${articulo.id}`}
      onClick={() => onSelectOperacion('o1')}
    >
      MOCK-{articulo.referencia}
    </button>
  )
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

describe('OperationSelectorCard', () => {
  const articulo = {
    id: 'a1',
    referencia: 'REF1',
    descripcion: 'Desc 1',
    estado: 'pendiente',
    linea: 1,
    cantidadOperaciones: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useGetArticulos as any).mockReturnValue({
      data: [articulo],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it('abre el dialog y permite seleccionar una operacion', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClear = vi.fn();
    const qc = createQueryClient();

    render(
      <QueryClientProvider client={qc}>
        <OperationSelectorCard onSelectOperacion={onSelect} onClearOperacion={onClear} />
      </QueryClientProvider>,
    );

    const openButton = screen.getByRole('button', { name: /seleccionar operación/i });
    await user.click(openButton);

    expect(await screen.findByRole('dialog')).toBeDefined();

    const articuloMockeado = await screen.findByTestId('mock-articulo-a1');
    await user.click(articuloMockeado);

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('o1');
    });
  });

  it('muestra el boton de salir y llama onClearOperacion cuando hay operacion seleccionada', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const qc = createQueryClient();

    render(
      <QueryClientProvider client={qc}>
        <OperationSelectorCard 
          selectedOperacionId="o1" 
          onClearOperacion={onClear} 
          onSelectOperacion={vi.fn()} 
        />
      </QueryClientProvider>,
    );

    const button = screen.getByRole('button', { name: /salir del registro/i });
    await user.click(button);

    expect(onClear).toHaveBeenCalled();
  });
});