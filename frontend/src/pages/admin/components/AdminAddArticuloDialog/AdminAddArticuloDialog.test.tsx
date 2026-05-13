import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AdminAddArticuloDialog } from './AdminAddArticuloDialog';

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSave: vi.fn(),
  isSubmitting: false,
};

describe('Componente: AdminAddArticuloDialog', () => {
  it('Renderiza el título por defecto', () => {
    render(<AdminAddArticuloDialog {...defaultProps} />);

    expect(screen.getByText('Añadir Nuevo Artículo')).toBeInTheDocument();
  });

  it('Renderiza título personalizado', () => {
    render(<AdminAddArticuloDialog {...defaultProps} title="Editar Artículo" />);

    expect(screen.getByText('Editar Artículo')).toBeInTheDocument();
  });

  it('No renderiza cuando open=false', () => {
    render(<AdminAddArticuloDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Añadir Nuevo Artículo')).not.toBeInTheDocument();
  });

  it('Muestra campos de formulario', () => {
    render(<AdminAddArticuloDialog {...defaultProps} />);

    expect(screen.getByLabelText(/Referencia/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Línea/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cantidad/)).toBeInTheDocument();
  });

  it('Botón Cancelar llama onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AdminAddArticuloDialog {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('Validación: error si referencia vacía al enviar', async () => {
    const user = userEvent.setup();
    render(<AdminAddArticuloDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Guardar Artículo' }));

    await waitFor(() => {
      expect(screen.getByText('La Referencia es obligatoria')).toBeInTheDocument();
    });
  });

  it('Validación: error si linea inválida', async () => {
    const user = userEvent.setup();
    render(<AdminAddArticuloDialog {...defaultProps} />);

    await user.type(screen.getByLabelText(/Referencia/), 'REF-001');
    const lineaInput = screen.getByLabelText(/Línea/);
    await user.type(lineaInput, '0');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Debe ser mayor a 0')).toBeInTheDocument();
    });
  });

  it('Submit con datos válidos llama onSave con los valores', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<AdminAddArticuloDialog {...defaultProps} onSave={onSave} />);

    await user.type(screen.getByLabelText(/Referencia/), 'REF-001');
    await user.type(screen.getByLabelText(/Línea/), '1');
    await user.type(screen.getByLabelText(/Cantidad/), '100');
    await user.click(screen.getByRole('button', { name: 'Guardar Artículo' }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
      const firstArg = onSave.mock.calls[0][0];
      expect(firstArg).toMatchObject({ referencia: 'REF-001', linea: '1', cantidad: '100' });
    });
  });

  it('isSubmitting=true: botones deshabilitados y texto "Guardando..."', () => {
    render(<AdminAddArticuloDialog {...defaultProps} isSubmitting={true} />);

    expect(screen.getByRole('button', { name: /Guardando/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
