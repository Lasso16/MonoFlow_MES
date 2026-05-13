import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ObservacionDialog } from './ObservacionDialog';

describe('Componente: ObservacionDialog', () => {
  const mockOnObservacionChange = vi.fn();
  const mockOnConfirm = vi.fn();

  const baseProps = {
    open: true,
    observacion: '',
    onClose: vi.fn(),
    onObservacionChange: mockOnObservacionChange,
    onConfirm: mockOnConfirm,
    isConfirmLoading: false,
  };

  it('Debería deshabilitar el botón si la observación está vacía', () => {
    render(<ObservacionDialog {...baseProps} observacion="   " />);
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
  });

  it('Debería avisar al padre cuando el usuario escribe', async () => {
    const user = userEvent.setup();
    render(<ObservacionDialog {...baseProps} />);

    const input = screen.getByPlaceholderText('Escribe una observación del registro');
    
    await user.type(input, 'X');

    expect(mockOnObservacionChange).toHaveBeenCalledWith('X');
  });

  it('Debería llamar a onConfirm al hacer clic en enviar', async () => {
    const user = userEvent.setup();
    render(<ObservacionDialog {...baseProps} observacion="Falta luz" />);

    await user.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(mockOnConfirm).toHaveBeenCalled();
  });
});