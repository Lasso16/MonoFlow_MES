import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProduccionDialog } from './ProduccionDialog';

describe('Componente: ProduccionDialog', () => {
  const mockTiposRechazo = [
    { id: 1, tipo: 'Defecto visual' },
    { id: 2, tipo: 'Error de medidas' },
  ];

  const defaultProps = {
    open: true,
    piezasBuenas: '',
    piezasRechazadas: '',
    selectedRechazoId: '',
    rechazoComentario: '',
    tiposRechazo: mockTiposRechazo,
    onClose: vi.fn(),
    onPiezasBuenasChange: vi.fn(),
    onPiezasRechazadasChange: vi.fn(),
    onSelectedRechazoIdChange: vi.fn(),
    onRechazoComentarioChange: vi.fn(),
    onConfirm: vi.fn(),
    isConfirmLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería renderizar el título y los inputs principales', () => {
    render(<ProduccionDialog {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /marcar producción/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/piezas buenas/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/piezas rechazadas/i)).toBeInTheDocument();
  });

  it('Debería tener el foco automático en el campo de piezas buenas', () => {
    render(<ProduccionDialog {...defaultProps} />);
    expect(screen.getByLabelText(/piezas buenas/i)).toHaveFocus();
  });

  it('Debería mostrar los campos de rechazo solo cuando piezasRechazadas > 0', () => {
    const { rerender } = render(<ProduccionDialog {...defaultProps} piezasRechazadas="0" />);
    
    // Con 0 no deberían estar
    expect(screen.queryByLabelText(/motivo de rechazo/i)).toBeNull();

    // Con 1 deberían aparecer
    rerender(<ProduccionDialog {...defaultProps} piezasRechazadas="1" />);
    expect(screen.getByLabelText(/motivo de rechazo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/comentario opcional/i)).toBeInTheDocument();
  });

  it('El botón Enviar debería estar deshabilitado si no hay ninguna cantidad', () => {
    render(<ProduccionDialog {...defaultProps} piezasBuenas="" piezasRechazadas="" />);
    
    const btnEnviar = screen.getByRole('button', { name: /^enviar$/i });
    expect(btnEnviar).toBeDisabled();
  });

  it('El botón Enviar debería estar deshabilitado si hay rechazos pero no hay motivo seleccionado', () => {
    render(
      <ProduccionDialog 
        {...defaultProps} 
        piezasRechazadas="5" 
        selectedRechazoId="" 
      />
    );
    
    const btnEnviar = screen.getByRole('button', { name: /^enviar$/i });
    expect(btnEnviar).toBeDisabled();
  });

  it('Debería llamar a onSelectedRechazoIdChange al seleccionar un motivo', async () => {
    const user = userEvent.setup();
    render(<ProduccionDialog {...defaultProps} piezasRechazadas="5" />);

    const selectTrigger = screen.getByLabelText(/motivo de rechazo/i);
    await user.click(selectTrigger);

    const opcion = screen.getByRole('option', { name: 'Defecto visual' });
    await user.click(opcion);

    expect(defaultProps.onSelectedRechazoIdChange).toHaveBeenCalledWith("1");
  });

  it('Debería habilitar el botón cuando los datos son válidos', () => {
    // Caso 1: Solo piezas buenas
    const { rerender } = render(<ProduccionDialog {...defaultProps} piezasBuenas="10" />);
    expect(screen.getByRole('button', { name: /^enviar$/i })).toBeEnabled();

    // Caso 2: Piezas rechazadas con motivo
    rerender(
      <ProduccionDialog 
        {...defaultProps} 
        piezasRechazadas="2" 
        selectedRechazoId="1" 
      />
    );
    expect(screen.getByRole('button', { name: /^enviar$/i })).toBeEnabled();
  });

  it('Debería mostrar "Enviando..." y deshabilitar el botón en estado de carga', () => {
    render(<ProduccionDialog {...defaultProps} piezasBuenas="10" isConfirmLoading={true} />);
    
    const btn = screen.getByRole('button', { name: /enviando.../i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });
});