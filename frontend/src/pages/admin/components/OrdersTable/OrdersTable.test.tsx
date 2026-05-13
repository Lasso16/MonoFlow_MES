import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { OrdersTable } from './OrdersTable';
import type { Orden } from '../../../../model/aggregates/Ordenes';

const makeOrden = (id: string, estado = '1'): Orden => ({
  id,
  idNavision: `NAV-${id}`,
  cliente: `Cliente ${id}`,
  descripcion: `Descripcion ${id}`,
  estado,
} as Orden);

const baseProps = {
  ordenes: [],
  totalRecords: 0,
  page: 0,
  isLoading: false,
  isError: false,
  error: null,
  isFetching: false,
  onPageChange: vi.fn(),
  onRowClick: vi.fn(),
};

describe('Componente: OrdersTable', () => {
  it('Muestra spinner cuando isLoading=true', () => {
    render(<OrdersTable {...baseProps} isLoading={true} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('Muestra mensaje de error cuando isError=true', () => {
    render(
      <OrdersTable
        {...baseProps}
        isError={true}
        error={new Error('Error de red')}
      />,
    );

    expect(screen.getByText('Error de red')).toBeInTheDocument();
  });

  it('Muestra mensaje genérico de error si error es null', () => {
    render(<OrdersTable {...baseProps} isError={true} error={null} />);

    expect(screen.getByText('No se pudieron cargar las ordenes.')).toBeInTheDocument();
  });

  it('Muestra mensaje vacío cuando no hay órdenes', () => {
    render(<OrdersTable {...baseProps} />);

    expect(screen.getByText('No hay ordenes para los filtros actuales.')).toBeInTheDocument();
  });

  it('Renderiza filas con los datos de cada orden', () => {
    const ordenes = [makeOrden('1'), makeOrden('2')];
    render(<OrdersTable {...baseProps} ordenes={ordenes} totalRecords={2} />);

    expect(screen.getByText('NAV-1')).toBeInTheDocument();
    expect(screen.getByText('Cliente 1')).toBeInTheDocument();
    expect(screen.getByText('NAV-2')).toBeInTheDocument();
  });

  it('Clic en fila llama onRowClick con la orden', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const ordenes = [makeOrden('1')];
    render(<OrdersTable {...baseProps} ordenes={ordenes} totalRecords={1} onRowClick={onRowClick} />);

    await user.click(screen.getByText('NAV-1'));

    expect(onRowClick).toHaveBeenCalledWith(ordenes[0]);
  });

  it('Muestra encabezados de tabla', () => {
    render(<OrdersTable {...baseProps} />);

    expect(screen.getByText('Id Navision')).toBeInTheDocument();
    expect(screen.getByText('Cliente')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
  });

  it('Muestra "Actualizando resultados..." cuando isFetching y no isLoading', () => {
    const ordenes = [makeOrden('1')];
    render(
      <OrdersTable
        {...baseProps}
        ordenes={ordenes}
        totalRecords={1}
        isFetching={true}
        isLoading={false}
      />,
    );

    expect(screen.getByText('Actualizando resultados...')).toBeInTheDocument();
  });

  it('Cliente vacío muestra guion', () => {
    const orden = { ...makeOrden('1'), cliente: '   ' };
    render(<OrdersTable {...baseProps} ordenes={[orden]} totalRecords={1} />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
