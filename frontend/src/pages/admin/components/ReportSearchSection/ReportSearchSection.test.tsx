import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ReportSearchSection } from './ReportSearchSection';

const defaultProps = {
  value: '',
  onChange: vi.fn(),
  onSearch: vi.fn(),
  loading: false,
};

describe('Componente: ReportSearchSection', () => {
  it('Renderiza campo ID Navision y botón Buscar', () => {
    render(<ReportSearchSection {...defaultProps} />);

    expect(screen.getByLabelText('ID Navision')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument();
  });

  it('Muestra el valor actual en el campo', () => {
    render(<ReportSearchSection {...defaultProps} value="NAV-001" />);

    expect(screen.getByDisplayValue('NAV-001')).toBeInTheDocument();
  });

  it('Escribir llama onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ReportSearchSection {...defaultProps} onChange={onChange} />);

    await user.type(screen.getByLabelText('ID Navision'), 'A');

    expect(onChange).toHaveBeenCalledWith('A');
  });

  it('Clic en Buscar llama onSearch', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<ReportSearchSection {...defaultProps} value="NAV-001" onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalled();
  });

  it('Enter en el campo llama onSearch', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<ReportSearchSection {...defaultProps} value="NAV-001" onSearch={onSearch} />);

    await user.type(screen.getByLabelText('ID Navision'), '{Enter}');

    expect(onSearch).toHaveBeenCalled();
  });

  it('Botón deshabilitado cuando value está vacío', () => {
    render(<ReportSearchSection {...defaultProps} value="" />);

    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
  });

  it('Botón deshabilitado cuando loading=true', () => {
    render(<ReportSearchSection {...defaultProps} value="NAV-001" loading={true} />);

    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
  });

  it('Muestra spinner cuando loading=true', () => {
    render(<ReportSearchSection {...defaultProps} value="NAV-001" loading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('No muestra spinner cuando loading=false', () => {
    render(<ReportSearchSection {...defaultProps} />);

    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});
