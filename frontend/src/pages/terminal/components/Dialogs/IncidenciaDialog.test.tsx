import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { IncidenciaDialog } from './IncidenciaDialog';

describe('Componente: IncidenciaDialog', () => {
  const mockIncidencias = [
    { id: 1, tipo: 'Falta de material' },
    { id: 2, tipo: 'Avería de máquina' },
  ];

  const defaultProps = {
    open: true,
    incidencias: mockIncidencias,
    selectedIncidenciaId: '',
    comentario: '',
    onClose: vi.fn(),
    onSelectedIncidenciaIdChange: vi.fn(),
    onComentarioChange: vi.fn(),
    onConfirm: vi.fn(),
    isConfirmLoading: false,
  };

  it('Debería renderizar correctamente con el título y etiquetas', () => {
    render(<IncidenciaDialog {...defaultProps} />);

    expect(screen.getByText('Registrar incidencia')).toBeInTheDocument();
    expect(screen.getByLabelText(/Motivo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Añade un comentario opcional')).toBeInTheDocument();
  });

  it('El botón de confirmar debería estar deshabilitado si no hay motivo seleccionado', () => {
    render(<IncidenciaDialog {...defaultProps} selectedIncidenciaId="" />);
    
    const btnConfirmar = screen.getByRole('button', { name: /Enviar incidencia/i });
    expect(btnConfirmar).toBeDisabled();
  });

  it('Debería llamar a onSelectedIncidenciaIdChange al seleccionar un motivo', async () => {
    const user = userEvent.setup();
    render(<IncidenciaDialog {...defaultProps} />);

    // En MUI Select, primero hacemos clic en el trigger para abrir el menú
    const selectTrigger = screen.getByLabelText(/Motivo/i);
    await user.click(selectTrigger);

    // Buscamos la opción en el portal (el menú que aparece)
    const opcion = screen.getByRole('option', { name: 'Falta de material' });
    await user.click(opcion);

    expect(defaultProps.onSelectedIncidenciaIdChange).toHaveBeenCalledWith("1");
  });

  it('Debería llamar a onComentarioChange al escribir en el campo de texto', async () => {
    const user = userEvent.setup();
    render(<IncidenciaDialog {...defaultProps} />);

    const input = screen.getByPlaceholderText('Añade un comentario opcional');
    await user.type(input, 'Texto de prueba');

    // Comprobamos que se llamó a la función (la última vez con la "e" final)
    expect(defaultProps.onComentarioChange).toHaveBeenCalled();
  });

  it('Debería mostrar "Enviando..." y deshabilitar botones durante la carga', () => {
    render(<IncidenciaDialog {...defaultProps} isConfirmLoading={true} selectedIncidenciaId="1" />);

    expect(screen.getByText('Enviando...')).toBeInTheDocument();
    const btnConfirmar = screen.getByRole('button', { name: /Enviando/i });
    expect(btnConfirmar).toBeDisabled();
  });

  it('Debería llamar a onConfirm al pulsar enviar con los datos rellenos', async () => {
    const user = userEvent.setup();
    render(<IncidenciaDialog {...defaultProps} selectedIncidenciaId="1" />);

    const btnConfirmar = screen.getByRole('button', { name: /Enviar incidencia/i });
    await user.click(btnConfirmar);

    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('Debería llamar a onClose al pulsar el botón Cancelar', async () => {
    const user = userEvent.setup();
    render(<IncidenciaDialog {...defaultProps} />);

    const btnCancelar = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(btnCancelar);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});