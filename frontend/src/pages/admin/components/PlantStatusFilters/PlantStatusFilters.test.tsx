import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PlantStatusFilters } from './PlantStatusfilters';

const defaultProps = {
  referencia: '',
  setReferencia: vi.fn(),
  descripcion: '',
  setDescripcion: vi.fn(),
  estado: '',
  setEstado: vi.fn(),
};

describe('Componente: PlantStatusFilters', () => {
  it('Renderiza los campos de Referencia y Descripción', () => {
    render(<PlantStatusFilters {...defaultProps} />);

    expect(screen.getByLabelText('Referencia')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
  });

  it('Renderiza el selector de Estado', () => {
    render(<PlantStatusFilters {...defaultProps} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('Escribir en Referencia llama setReferencia', async () => {
    const user = userEvent.setup();
    const setReferencia = vi.fn();
    render(<PlantStatusFilters {...defaultProps} setReferencia={setReferencia} />);

    await user.type(screen.getByLabelText('Referencia'), 'REF-001');

    expect(setReferencia).toHaveBeenCalled();
  });

  it('Escribir en Descripción llama setDescripcion', async () => {
    const user = userEvent.setup();
    const setDescripcion = vi.fn();
    render(<PlantStatusFilters {...defaultProps} setDescripcion={setDescripcion} />);

    await user.type(screen.getByLabelText('Descripción'), 'Silla');

    expect(setDescripcion).toHaveBeenCalled();
  });

  it('Selector Estado muestra opciones Todos, En curso, Pendiente', async () => {
    const user = userEvent.setup();
    render(<PlantStatusFilters {...defaultProps} />);

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('option', { name: 'Todos' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'En curso' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Pendiente' })).toBeInTheDocument();
  });

  it('Seleccionar estado llama setEstado con el valor correcto', async () => {
    const user = userEvent.setup();
    const setEstado = vi.fn();
    render(<PlantStatusFilters {...defaultProps} setEstado={setEstado} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'En curso' }));

    expect(setEstado).toHaveBeenCalledWith('1');
  });

  it('Muestra los valores actuales en los campos de texto', () => {
    render(
      <PlantStatusFilters
        {...defaultProps}
        referencia="REF-XYZ"
        descripcion="Mesa"
        estado="0"
      />,
    );

    expect(screen.getByDisplayValue('REF-XYZ')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mesa')).toBeInTheDocument();
  });
});
