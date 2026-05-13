import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { OrdersFilterPanel } from './OrdersFilterPanel';

const defaultProps = {
  filters: { estados: [], idNavision: '', cliente: '' },
  onToggleEstado: vi.fn(),
  onIdNavisionInputChange: vi.fn(),
  onClienteInputChange: vi.fn(),
  onResetFilters: vi.fn(),
};

describe('Componente: OrdersFilterPanel', () => {
  it('Renderiza los tres chips de estado', () => {
    render(<OrdersFilterPanel {...defaultProps} />);

    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('En curso')).toBeInTheDocument();
    expect(screen.getByText('Finalizadas')).toBeInTheDocument();
  });

  it('Clic en chip llama onToggleEstado con el valor correcto', async () => {
    const user = userEvent.setup();
    const onToggleEstado = vi.fn();
    render(<OrdersFilterPanel {...defaultProps} onToggleEstado={onToggleEstado} />);

    await user.click(screen.getByText('Pendiente'));

    expect(onToggleEstado).toHaveBeenCalledWith('0');
  });

  it('Clic en "En curso" llama onToggleEstado con "1"', async () => {
    const user = userEvent.setup();
    const onToggleEstado = vi.fn();
    render(<OrdersFilterPanel {...defaultProps} onToggleEstado={onToggleEstado} />);

    await user.click(screen.getByText('En curso'));

    expect(onToggleEstado).toHaveBeenCalledWith('1');
  });

  it('Escribir en Id Navision llama onIdNavisionInputChange', async () => {
    const user = userEvent.setup();
    const onIdNavisionInputChange = vi.fn();
    render(<OrdersFilterPanel {...defaultProps} onIdNavisionInputChange={onIdNavisionInputChange} />);

    const input = screen.getByLabelText('Id Navision');
    await user.type(input, 'NAV-001');

    expect(onIdNavisionInputChange).toHaveBeenCalled();
  });

  it('Escribir en Cliente llama onClienteInputChange', async () => {
    const user = userEvent.setup();
    const onClienteInputChange = vi.fn();
    render(<OrdersFilterPanel {...defaultProps} onClienteInputChange={onClienteInputChange} />);

    const input = screen.getByLabelText('Cliente');
    await user.type(input, 'Acme');

    expect(onClienteInputChange).toHaveBeenCalled();
  });

  it('Botón Limpiar llama onResetFilters', async () => {
    const user = userEvent.setup();
    const onResetFilters = vi.fn();
    render(<OrdersFilterPanel {...defaultProps} onResetFilters={onResetFilters} />);

    await user.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(onResetFilters).toHaveBeenCalled();
  });

  it('Muestra conteo de filtros activos y el filtro idNavision activo', () => {
    const { container } = render(
      <OrdersFilterPanel
        {...defaultProps}
        filters={{ estados: ['0', '1'], idNavision: 'NAV-001', cliente: '' }}
      />,
    );

    expect(container).toHaveTextContent(/2 estado/);
    expect(container).toHaveTextContent(/Id Navision/);
  });

  it('Sin filtros activos muestra "0 estado(s)"', () => {
    render(<OrdersFilterPanel {...defaultProps} />);

    expect(screen.getByText('Filtros activos: 0 estado(s)')).toBeInTheDocument();
  });
});
