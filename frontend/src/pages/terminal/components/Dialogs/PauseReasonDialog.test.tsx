import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PauseReasonDialog } from './PauseReasonDialog';

describe('Componente: PauseReasonDialog', () => {
  const defaultProps = {
    open: true,
    pauseReason: '',
    onClose: vi.fn(),
    onPauseReasonChange: vi.fn(),
    onConfirm: vi.fn(),
    isConfirmLoading: false,
  };

  it('Debería renderizar el diálogo con el título y el campo de texto correctos', () => {
    render(<PauseReasonDialog {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /iniciar pausa/i })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /iniciar pausa/i })).toBeInTheDocument();

    const input = screen.getByLabelText(/motivo/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Almuerzo');
  });

  it('Debería llamar a onPauseReasonChange cuando el usuario escribe', async () => {
    const user = userEvent.setup();
    render(<PauseReasonDialog {...defaultProps} />);

    const input = screen.getByLabelText(/Motivo/i);
    await user.type(input, 'Descanso');

    expect(defaultProps.onPauseReasonChange).toHaveBeenCalled();
  });

  it('Debería llamar a onConfirm al pulsar el botón de Iniciar pausa', async () => {
    const user = userEvent.setup();
    render(<PauseReasonDialog {...defaultProps} />);

    const btnConfirmar = screen.getByRole('button', { name: 'Iniciar pausa' });
    await user.click(btnConfirmar);

    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('Debería llamar a onClose al pulsar el botón de Cancelar', async () => {
    const user = userEvent.setup();
    render(<PauseReasonDialog {...defaultProps} />);

    const btnCancelar = screen.getByRole('button', { name: 'Cancelar' });
    await user.click(btnCancelar);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('Debería mostrar el estado de carga correctamente', () => {
    render(<PauseReasonDialog {...defaultProps} isConfirmLoading={true} />);

    const btnConfirmar = screen.getByRole('button', { name: 'Iniciando...' });
    
    expect(btnConfirmar).toBeInTheDocument();
    expect(btnConfirmar).toBeDisabled();
  });

  it('El campo de texto debería tener el foco automático al abrirse', () => {
    render(<PauseReasonDialog {...defaultProps} />);
    
    const input = screen.getByLabelText(/Motivo/i);
    expect(input).toHaveFocus();
  });
});