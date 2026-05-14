import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdminOrders } from './useAdminOrders';

vi.mock('../../../hooks/queries/useOrdenesQueries', () => ({
  useGetOrdenes: vi.fn(),
}));

vi.mock('../../../utils/estadoArticulosUtils', () => ({
  getEstadoKind: vi.fn((estado: string) => {
    if (estado === 'Pendiente') return 'pendiente';
    if (estado === 'En curso') return 'enejecucion';
    if (estado === 'Finalizada') return 'finproduccion';
    return 'desconocido';
  }),
}));

import { useGetOrdenes } from '../../../hooks/queries/useOrdenesQueries';

const makeOrden = (id: string, estado: string) => ({ id, estado, cliente: 'Cliente', idNavision: id });

describe('Hook: useAdminOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetOrdenes).mockReturnValue({
      data: { items: [], totalRecords: 0, pageNumber: 1, pageSize: 20 },
      isLoading: false,
      isError: false,
      isFetching: false,
      error: null,
    } as any);
  });

  it('Estado inicial: page=0, filtros vacíos, sin órdenes', () => {
    const { result } = renderHook(() => useAdminOrders());

    expect(result.current.page).toBe(0);
    expect(result.current.filters.estados).toEqual([]);
    expect(result.current.filters.idNavision).toBe('');
    expect(result.current.filters.cliente).toBe('');
    expect(result.current.ordenes).toEqual([]);
    expect(result.current.totalRecords).toBe(0);
  });

  it('Sin filtro de estados: devuelve todos los items y usa totalRecords de la API', () => {
    const items = [makeOrden('1', 'Pendiente'), makeOrden('2', 'En curso')];
    vi.mocked(useGetOrdenes).mockReturnValue({
      data: { items: items, totalRecords: 50, pageNumber: 1, pageSize: 20 },
      isLoading: false, isError: false, isFetching: false, error: null,
    } as any);

    const { result } = renderHook(() => useAdminOrders());

    expect(result.current.ordenes).toHaveLength(2);
    expect(result.current.totalRecords).toBe(50);
  });

  it('toggleEstado añade estado y resetea página', () => {
    const items = [makeOrden('1', 'Pendiente'), makeOrden('2', 'En curso')];
    vi.mocked(useGetOrdenes).mockReturnValue({
      data: { items: items, totalRecords: 2, pageNumber: 1, pageSize: 20 },
      isLoading: false, isError: false, isFetching: false, error: null,
    } as any);

    const { result } = renderHook(() => useAdminOrders());

    act(() => { result.current.handlePageChange(2); });
    expect(result.current.page).toBe(2);

    act(() => { result.current.toggleEstado('Pendiente'); });

    expect(result.current.filters.estados).toEqual(['Pendiente']);
    expect(result.current.page).toBe(0);
  });

  it('toggleEstado quita el estado si ya estaba', () => {
    const { result } = renderHook(() => useAdminOrders());

    act(() => { result.current.toggleEstado('Pendiente'); });
    act(() => { result.current.toggleEstado('Pendiente'); });

    expect(result.current.filters.estados).toEqual([]);
  });

  it('Con filtro de estados: filtra por getEstadoKind y usa longitud filtrada como totalRecords', () => {
    const items = [
      makeOrden('1', 'Pendiente'),
      makeOrden('2', 'En curso'),
      makeOrden('3', 'Finalizada'),
    ];
    vi.mocked(useGetOrdenes).mockReturnValue({
      data: { items: items, totalRecords: 100, pageNumber: 1, pageSize: 20 },
      isLoading: false, isError: false, isFetching: false, error: null,
    } as any);

    const { result } = renderHook(() => useAdminOrders());

    act(() => { result.current.toggleEstado('Pendiente'); });

    expect(result.current.ordenes).toHaveLength(1);
    expect(result.current.ordenes[0].id).toBe('1');
    expect(result.current.totalRecords).toBe(1);
  });

  it('handleIdNavisionInputChange actualiza filtro y resetea página', () => {
    const { result } = renderHook(() => useAdminOrders());

    act(() => { result.current.handlePageChange(3); });
    act(() => { result.current.handleIdNavisionInputChange('NAV-001'); });

    expect(result.current.filters.idNavision).toBe('NAV-001');
    expect(result.current.page).toBe(0);
  });

  it('handleClienteInputChange actualiza filtro y resetea página', () => {
    const { result } = renderHook(() => useAdminOrders());

    act(() => { result.current.handlePageChange(2); });
    act(() => { result.current.handleClienteInputChange('Acme'); });

    expect(result.current.filters.cliente).toBe('Acme');
    expect(result.current.page).toBe(0);
  });

  it('handleResetFilters restaura estado por defecto', () => {
    const { result } = renderHook(() => useAdminOrders());

    act(() => {
      result.current.handlePageChange(3);
      result.current.toggleEstado('Pendiente');
      result.current.handleIdNavisionInputChange('NAV-001');
      result.current.handleClienteInputChange('Acme');
    });

    act(() => { result.current.handleResetFilters(); });

    expect(result.current.page).toBe(0);
    expect(result.current.filters.estados).toEqual([]);
    expect(result.current.filters.idNavision).toBe('');
    expect(result.current.filters.cliente).toBe('');
  });

  it('handlePageChange cambia la página', () => {
    const { result } = renderHook(() => useAdminOrders());

    act(() => { result.current.handlePageChange(5); });

    expect(result.current.page).toBe(5);
  });

  it('Expone estados de carga y error de la query', () => {
    vi.mocked(useGetOrdenes).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: true,
      isFetching: true,
      error: new Error('Fallo de red'),
    } as any);

    const { result } = renderHook(() => useAdminOrders());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(true);
    expect(result.current.isFetching).toBe(true);
    expect(result.current.error?.message).toBe('Fallo de red');
  });

  it('data undefined: ordenes vacío, totalRecords 0', () => {
    vi.mocked(useGetOrdenes).mockReturnValue({
      data: undefined,
      isLoading: false, isError: false, isFetching: false, error: null,
    } as any);

    const { result } = renderHook(() => useAdminOrders());

    expect(result.current.ordenes).toEqual([]);
    expect(result.current.totalRecords).toBe(0);
  });
});
