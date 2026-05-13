import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RegistroErrorSnackbar } from './RegistroErrorSnackbar';

describe('Componente: RegistroErrorSnackbar', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Debería renderizar el mensaje cuando la prop "message" tiene contenido', () => {
    render(<RegistroErrorSnackbar message="Error de conexión" onClose={mockOnClose} />);

    expect(screen.getByText('Error de conexión')).toBeInTheDocument();
  });

  it('No debería mostrar nada si el mensaje es null', () => {
    render(<RegistroErrorSnackbar message={null} onClose={mockOnClose} />);

    expect(screen.queryByText(/error/i)).toBeNull();
  });

  it('Debería llamar a onClose al pulsar el botón de cerrar de la alerta', async () => {
    const user = userEvent.setup();
    render(<RegistroErrorSnackbar message="Mensaje de prueba" onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it('Debería llamar a onClose automáticamente tras 5 segundos (autoHideDuration)', () => {
    vi.useFakeTimers();
    
    render(<RegistroErrorSnackbar message="Se cerrará solo" onClose={mockOnClose} />);

    expect(mockOnClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('Debería tener la severidad "warning" como indica el código', () => {
    render(<RegistroErrorSnackbar message="Atención" onClose={mockOnClose} />);

    const alertElement = screen.getByRole('alert');
    
    expect(alertElement).toHaveClass('MuiAlert-filled');
    expect(alertElement).toHaveClass('MuiAlert-colorWarning');
  });
});