import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdminReports } from './useAdminReports';

vi.mock('html2pdf.js', () => ({
  default: vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    save: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('../../../hooks/queries/useOrdenesQueries', () => ({
  useGetOrdenes: vi.fn(),
}));

vi.mock('../../../api', () => ({
  GET_articulosOrden: vi.fn(),
  GET_operacionesArticulo: vi.fn(),
  GET_operacionResumen: vi.fn(),
}));

vi.mock('../utils/reportUtils/reportUtils', () => ({
  buildInformeHtml: vi.fn(() => '<html></html>'),
}));

import { useGetOrdenes } from '../../../hooks/queries/useOrdenesQueries';
import { GET_articulosOrden, GET_operacionesArticulo, GET_operacionResumen } from '../../../api';

const makeOrden = (id: string) => ({
  id,
  idNavision: `NAV-${id}`,
  cliente: 'Cliente Test',
  estado: '1',
});

const makeArticulo = (id: string) => ({ id, referencia: `REF-${id}` });

const makeOperacion = (id: string) => ({
  id,
  tipoOperacion: 'Montaje',
  articuloDescripcion: `REF-${id}`,
});

describe('Hook: useAdminReports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetOrdenes).mockReturnValue({
      data: { Items: [], TotalRecords: 0 },
      isLoading: false,
      isError: false,
    } as any);
  });

  it('Estado inicial correcto', () => {
    const { result } = renderHook(() => useAdminReports());

    expect(result.current.searchTerm).toBe('');
    expect(result.current.ordenes).toEqual([]);
    expect(result.current.selectedOrden).toBeNull();
    expect(result.current.operaciones).toEqual([]);
    expect(result.current.selectedOperacion).toBeNull();
    expect(result.current.isExporting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handleSearch guarda el searchTerm como searchQuery y limpia selección', async () => {
    vi.mocked(useGetOrdenes).mockReturnValue({
      data: { Items: [makeOrden('1')], TotalRecords: 1 },
      isLoading: false,
      isError: false,
    } as any);

    const { result } = renderHook(() => useAdminReports());

    act(() => { result.current.setSearchTerm('  NAV-001  '); });
    act(() => { result.current.handleSearch(); });

    expect(vi.mocked(useGetOrdenes).mock.calls.at(-1)?.[2]).toEqual({ idNavision: 'NAV-001' });
  });

  it('ordenes viene de data.Items de la query', () => {
    const ordenes = [makeOrden('1'), makeOrden('2')];
    vi.mocked(useGetOrdenes).mockReturnValue({
      data: { Items: ordenes, TotalRecords: 2 },
      isLoading: false,
      isError: false,
    } as any);

    const { result } = renderHook(() => useAdminReports());

    expect(result.current.ordenes).toHaveLength(2);
  });

  it('handleSelectOrden carga artículos y operaciones', async () => {
    const orden = makeOrden('ORD-1');
    const articulo = makeArticulo('ART-1');
    const operacion = makeOperacion('OP-1');

    vi.mocked(GET_articulosOrden).mockResolvedValue({ isFailure: false, value: [articulo] } as any);
    vi.mocked(GET_operacionesArticulo).mockResolvedValue({
      isFailure: false,
      value: { items: [operacion] },
    } as any);

    const { result } = renderHook(() => useAdminReports());

    await act(async () => { await result.current.handleSelectOrden(orden as any); });

    expect(result.current.selectedOrden).toEqual(orden);
    expect(result.current.operaciones).toHaveLength(1);
    expect(result.current.operaciones[0].id).toBe('OP-1');
    expect(result.current.loadingOps).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handleSelectOrden muestra error si GET_articulosOrden falla', async () => {
    vi.mocked(GET_articulosOrden).mockResolvedValue({ isFailure: true, error: 'Error' } as any);

    const { result } = renderHook(() => useAdminReports());

    await act(async () => {
      await result.current.handleSelectOrden(makeOrden('ORD-1') as any);
    });

    expect(result.current.error).toBe('No se pudieron cargar las operaciones.');
    expect(result.current.loadingOps).toBe(false);
  });

  it('handleExport no hace nada si no hay orden o operación seleccionada', async () => {
    const { result } = renderHook(() => useAdminReports());

    await act(async () => { await result.current.handleExport(); });

    expect(GET_operacionResumen).not.toHaveBeenCalled();
  });

  it('handleExport llama GET_operacionResumen y genera PDF', async () => {
    const orden = makeOrden('ORD-1');
    const operacion = makeOperacion('OP-1');

    vi.mocked(GET_operacionResumen).mockResolvedValue({
      isFailure: false,
      value: { detalleRegistros: [] },
    } as any);

    const { result } = renderHook(() => useAdminReports());

    act(() => {
      result.current.setSelectedOperacion(operacion as any);
      (result.current as any).selectedOrden = orden;
    });

    await act(async () => {
      result.current.setSelectedOperacion(operacion as any);
    });

    vi.mocked(GET_articulosOrden).mockResolvedValue({ isFailure: false, value: [makeArticulo('ART-1')] } as any);
    vi.mocked(GET_operacionesArticulo).mockResolvedValue({ isFailure: false, value: { items: [operacion] } } as any);

    await act(async () => { await result.current.handleSelectOrden(orden as any); });
    await act(async () => {
      result.current.setSelectedOperacion(result.current.operaciones[0]);
    });
    await act(async () => { await result.current.handleExport(); });

    expect(GET_operacionResumen).toHaveBeenCalledWith('OP-1');
    expect(result.current.isExporting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handleExport muestra error si GET_operacionResumen lanza excepción', async () => {
    const orden = makeOrden('ORD-1');
    const operacion = makeOperacion('OP-1');

    vi.mocked(GET_articulosOrden).mockResolvedValue({ isFailure: false, value: [makeArticulo('ART-1')] } as any);
    vi.mocked(GET_operacionesArticulo).mockResolvedValue({ isFailure: false, value: { items: [operacion] } } as any);
    vi.mocked(GET_operacionResumen).mockRejectedValue(new Error('Fallo al obtener resumen'));

    const { result } = renderHook(() => useAdminReports());

    await act(async () => { await result.current.handleSelectOrden(orden as any); });
    await act(async () => { result.current.setSelectedOperacion(result.current.operaciones[0]); });
    await act(async () => { await result.current.handleExport(); });

    expect(result.current.error).toBe('Error al generar y descargar el PDF.');
    expect(result.current.isExporting).toBe(false);
  });

  it('Expone loadingOrders y ordersError de la query', () => {
    vi.mocked(useGetOrdenes).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: true,
    } as any);

    const { result } = renderHook(() => useAdminReports());

    expect(result.current.loadingOrders).toBe(true);
    expect(result.current.ordersError).toBe(true);
  });
});
