import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminCreateOperacionDialog } from './AdminCreateOperacionDialog';

vi.mock('../../../../hooks/queries/useArticulosQueries', () => ({
  useArticulosMutations: vi.fn(),
}));

import { useArticulosMutations } from '../../../../hooks/queries/useArticulosQueries';

const makeMutations = (overrides = {}) => ({
  addOperacionArticuloMutation: {
    mutate: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    ...overrides,
  },
  updateArticuloMutation: { mutate: vi.fn() },
  deleteArticuloMutation: { mutate: vi.fn() },
});

const tiposOptions = [
  { id: 1, label: 'Montaje' },
  { id: 2, label: 'Ensamblaje' },
];

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  articuloId: 'ART-1',
  articuloLabel: 'REF-001',
  tiposOperacionOptions: tiposOptions,
};

describe('Componente: AdminCreateOperacionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useArticulosMutations).mockReturnValue(makeMutations() as any);
  });

  it('Renderiza título con el artículo', () => {
    render(<AdminCreateOperacionDialog {...defaultProps} />);

    expect(screen.getByText(/Nueva operacion para REF-001/)).toBeInTheDocument();
  });

  it('No renderiza cuando open=false', () => {
    render(<AdminCreateOperacionDialog {...defaultProps} open={false} />);

    expect(screen.queryByText(/Nueva operacion/)).not.toBeInTheDocument();
  });

  it('Muestra los tipos de operación en el selector', async () => {
    const user = userEvent.setup();
    render(<AdminCreateOperacionDialog {...defaultProps} />);

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('option', { name: 'Montaje' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Ensamblaje' })).toBeInTheDocument();
  });

  it('Botón Cancelar llama onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AdminCreateOperacionDialog {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('Botón Crear deshabilitado si no hay tipos de operación', () => {
    render(<AdminCreateOperacionDialog {...defaultProps} tiposOperacionOptions={[]} />);

    expect(screen.getByRole('button', { name: 'Crear operacion' })).toBeDisabled();
  });

  it('Validación: error si cantidadComponentes vacía al enviar', async () => {
    const user = userEvent.setup();
    render(<AdminCreateOperacionDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Crear operacion' }));

    await waitFor(() => {
      expect(
        screen.getByText('La cantidad de componentes es obligatoria'),
      ).toBeInTheDocument();
    });
  });

  it('Validación: error si tiempoPlan contiene cero', async () => {
    const user = userEvent.setup();
    render(<AdminCreateOperacionDialog {...defaultProps} />);

    const tiempoInput = screen.getByLabelText(/Tiempo plan/);
    await user.type(tiempoInput, '0');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('Solo se admiten números válidos (1 o mayores)'),
      ).toBeInTheDocument();
    });
  });

  it('Muestra error del servidor cuando mutation falla', () => {
    vi.mocked(useArticulosMutations).mockReturnValue(
      makeMutations({
        isError: true,
        error: { message: 'Error del servidor' },
      }) as any,
    );
    render(<AdminCreateOperacionDialog {...defaultProps} />);

    expect(screen.getByText('Error del servidor')).toBeInTheDocument();
  });

  it('isSubmitting: botones deshabilitados y texto "Creando..."', () => {
    vi.mocked(useArticulosMutations).mockReturnValue(
      makeMutations({ isPending: true }) as any,
    );
    render(<AdminCreateOperacionDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: /Creando/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
