import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTerminalData } from './useTerminalData';

const mockInvalidateQueries = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

vi.mock('./useTiposRechazoNormalizados', () => ({
  useTiposRechazoNormalizados: (data: any) => data,
}));

vi.mock('../../../hooks/queries/useArticulosQueries', () => ({
  useGetArticuloById: vi.fn(),
}));
vi.mock('../../../hooks/queries/useMaestrosQueries', () => ({
  useGetTiposIncidencia: vi.fn(),
  useGetTiposRechazo: vi.fn(),
}));
vi.mock('../../../hooks/queries/useOperacionesQueries', () => ({
  useGetOperacionById: vi.fn(),
  useGetOperacionProgreso: vi.fn(),
}));
vi.mock('../../../hooks/queries/useOrdenesQueries', () => ({
  useGetOrdenById: vi.fn(),
}));
vi.mock('../../../hooks/queries/useRegistroTrabajoQueries', () => ({
  useGetRegistroActualOperacion: vi.fn(),
}));

import { useGetArticuloById } from '../../../hooks/queries/useArticulosQueries';
import { useGetTiposIncidencia, useGetTiposRechazo } from '../../../hooks/queries/useMaestrosQueries';
import { useGetOperacionById, useGetOperacionProgreso } from '../../../hooks/queries/useOperacionesQueries';
import { useGetOrdenById } from '../../../hooks/queries/useOrdenesQueries';
import { useGetRegistroActualOperacion } from '../../../hooks/queries/useRegistroTrabajoQueries';

describe('Hook: useTerminalData', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useGetTiposIncidencia).mockReturnValue({ data: [{ id: 1, tipo: 'Fallo' }], isLoading: false } as any);
    vi.mocked(useGetTiposRechazo).mockReturnValue({ data: [{ id: 2, tipo: 'Roto' }], isLoading: false } as any);
    vi.mocked(useGetOperacionById).mockReturnValue({ data: { id: 'OP-1', idArticulo: 'ART-1' }, isError: false } as any);
    vi.mocked(useGetOperacionProgreso).mockReturnValue({ data: { fabricado: 10 }, isError: false } as any);
    vi.mocked(useGetArticuloById).mockReturnValue({ data: { id: 'ART-1', idOrden: 'ORD-1' } } as any);
    vi.mocked(useGetOrdenById).mockReturnValue({ data: { id: 'ORD-1', cliente: 'Cliente X' } } as any);
    vi.mocked(useGetRegistroActualOperacion).mockReturnValue({ data: { id: 'REG-1' }, isLoading: false, isError: false } as any);
  });

  it('Debería cargar y empaquetar todos los datos correctamente si recibe un ID', () => {
    const { result } = renderHook(() => useTerminalData('OP-1'));

    expect(result.current.operacion?.id).toBe('OP-1');
    expect(result.current.articulo?.idOrden).toBe('ORD-1');
    expect(result.current.orden?.cliente).toBe('Cliente X');
    expect(result.current.tiposIncidencia).toHaveLength(1);
    expect(result.current.operacionLoadErrorMessage).toBe(null);

    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  it('Debería limpiar la caché de React Query si no se proporciona un ID', () => {
    renderHook(() => useTerminalData(undefined));

    expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["articulos"] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["operaciones-articulo"] });
  });

  it('Debería generar un mensaje de error si falla la carga de la operación', () => {
    vi.mocked(useGetOperacionById).mockReturnValue({ 
      data: null, 
      isError: true, 
      error: { message: "Error 404: Operación no encontrada" } 
    } as any);

    const { result } = renderHook(() => useTerminalData('OP-1'));

    expect(result.current.operacionLoadErrorMessage).toBe("Error 404: Operación no encontrada");
  });

  it('Debería generar un mensaje de error si falla la carga del progreso', () => {
    vi.mocked(useGetOperacionProgreso).mockReturnValue({ 
      data: null, 
      isError: true, 
      error: { message: "Error al calcular progreso" } 
    } as any);

    const { result } = renderHook(() => useTerminalData('OP-1'));

    expect(result.current.operacionLoadErrorMessage).toBe("Error al calcular progreso");
  });
});