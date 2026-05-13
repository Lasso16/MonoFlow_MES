import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdminPlantStatus } from './useAdminPlantStatus';

vi.mock('../../../hooks/queries/useArticulosQueries', () => ({
  useGetArticulosPaged: vi.fn(),
}));

vi.mock('../../../utils/estadoArticulosUtils', () => ({
  isArticuloVisible: vi.fn((art: any) => art.visible !== false),
}));

import { useGetArticulosPaged } from '../../../hooks/queries/useArticulosQueries';

const makeArticulo = (id: string, finPlan: string | null, visible = true) => ({
  id,
  finPlan,
  visible,
  referencia: id,
  descripcion: '',
  estado: '1',
  linea: 1,
});

// 1. Creamos un Wrapper que inyecta el QueryClient para los tests
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Hook: useAdminPlantStatus', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetArticulosPaged).mockReturnValue({
      data: { Items: [], TotalRecords: 0, PageNumber: 1, PageSize: 10 },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
      refetch: mockRefetch,
    } as any);
  });

  it('Estado inicial correcto', () => {
    // 2. Pasamos el wrapper como opción en renderHook
    const { result } = renderHook(() => useAdminPlantStatus(), {
      wrapper: createWrapper(),
    });

    expect(result.current.page).toBe(0);
    expect(result.current.referenciaFiltro).toBe('');
    expect(result.current.descripcionFiltro).toBe('');
    expect(result.current.estadoFiltro).toBe('');
    expect(result.current.selectedOp).toBeNull();
    expect(result.current.articulosEnPlanta).toEqual([]);
    expect(result.current.totalRecords).toBe(0);
  });

  it('articulosEnPlanta filtra con isArticuloVisible', () => {
    const items = [
      makeArticulo('A', '2026-06-01', true),
      makeArticulo('B', '2026-05-01', false),
    ];
    vi.mocked(useGetArticulosPaged).mockReturnValue({
      data: { Items: items, TotalRecords: 2, PageNumber: 1, PageSize: 10 },
      isLoading: false, isError: false, error: null, isFetching: false, refetch: mockRefetch,
    } as any);

    const { result } = renderHook(() => useAdminPlantStatus(), { wrapper: createWrapper() });

    expect(result.current.articulosEnPlanta).toHaveLength(1);
    expect(result.current.articulosEnPlanta[0].id).toBe('A');
  });

  it('articulosEnPlanta ordena por finPlan ascendente', () => {
    const items = [
      makeArticulo('tarde', '2026-12-01'),
      makeArticulo('pronto', '2026-01-01'),
      makeArticulo('medio', '2026-06-01'),
    ];
    vi.mocked(useGetArticulosPaged).mockReturnValue({
      data: { Items: items, TotalRecords: 3, PageNumber: 1, PageSize: 10 },
      isLoading: false, isError: false, error: null, isFetching: false, refetch: mockRefetch,
    } as any);

    const { result } = renderHook(() => useAdminPlantStatus(), { wrapper: createWrapper() });

    const ids = result.current.articulosEnPlanta.map((a) => a.id);
    expect(ids).toEqual(['pronto', 'medio', 'tarde']);
  });

  it('articulosEnPlanta pone artículos sin finPlan al final', () => {
    const items = [
      makeArticulo('sin-fecha', null),
      makeArticulo('con-fecha', '2026-03-01'),
    ];
    vi.mocked(useGetArticulosPaged).mockReturnValue({
      data: { Items: items, TotalRecords: 2, PageNumber: 1, PageSize: 10 },
      isLoading: false, isError: false, error: null, isFetching: false, refetch: mockRefetch,
    } as any);

    const { result } = renderHook(() => useAdminPlantStatus(), { wrapper: createWrapper() });

    expect(result.current.articulosEnPlanta[0].id).toBe('con-fecha');
    expect(result.current.articulosEnPlanta[1].id).toBe('sin-fecha');
  });

  it('handleSelectOperacion guarda la operación seleccionada', () => {
    const { result } = renderHook(() => useAdminPlantStatus(), { wrapper: createWrapper() });

    act(() => { result.current.handleSelectOperacion('OP-1', 'Montaje'); });

    expect(result.current.selectedOp).toEqual({ id: 'OP-1', tipo: 'Montaje' });
  });

  it('handleCloseDialog limpia selectedOp', () => {
    const { result } = renderHook(() => useAdminPlantStatus(), { wrapper: createWrapper() });

    act(() => { result.current.handleSelectOperacion('OP-1', 'Montaje'); });
    act(() => { result.current.handleCloseDialog(); });

    expect(result.current.selectedOp).toBeNull();
  });

  it('setReferenciaFiltro actualiza filtro y resetea página', () => {
    const { result } = renderHook(() => useAdminPlantStatus(), { wrapper: createWrapper() });

    act(() => { result.current.setPage(3); });
    act(() => { result.current.setReferenciaFiltro('REF-001'); });

    expect(result.current.referenciaFiltro).toBe('REF-001');
    expect(result.current.page).toBe(0);
  });

  it('setDescripcionFiltro actualiza filtro y resetea página', () => {
    const { result } = renderHook(() => useAdminPlantStatus(), { wrapper: createWrapper() });

    act(() => { result.current.setPage(2); });
    act(() => { result.current.setDescripcionFiltro('Silla'); });

    expect(result.current.descripcionFiltro).toBe('Silla');
    expect(result.current.page).toBe(0);
  });

  it('setEstadoFiltro actualiza filtro y resetea página', () => {
    const { result } = renderHook(() => useAdminPlantStatus(), { wrapper: createWrapper() });

    act(() => { result.current.setPage(1); });
    act(() => { result.current.setEstadoFiltro('pendiente'); });

    expect(result.current.estadoFiltro).toBe('pendiente');
    expect(result.current.page).toBe(0);
  });

  it('totalRecords viene de TotalRecords de la API', () => {
    vi.mocked(useGetArticulosPaged).mockReturnValue({
      data: { Items: [], TotalRecords: 42, PageNumber: 1, PageSize: 10 },
      isLoading: false, isError: false, error: null, isFetching: false, refetch: mockRefetch,
    } as any);

    const { result } = renderHook(() => useAdminPlantStatus(), { wrapper: createWrapper() });

    expect(result.current.totalRecords).toBe(42);
  });

  it('Expone estados de carga y error', () => {
    vi.mocked(useGetArticulosPaged).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: true,
      error: new Error('Sin conexión'),
      isFetching: true,
      refetch: mockRefetch,
    } as any);

    const { result } = renderHook(() => useAdminPlantStatus(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(true);
    expect(result.current.isFetching).toBe(true);
  });
});