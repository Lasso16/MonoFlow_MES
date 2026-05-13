import { renderHook, act } from '@testing-library/react';import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTerminalHistoryData } from './useTerminalHistoryData';

import { useGetTiposEvento } from '../../../hooks/queries/useMaestrosQueries';

vi.mock('../../../hooks/queries/useMaestrosQueries', () => ({
  useGetTiposEvento: vi.fn(),
}));

describe('Hook: useTerminalHistoryData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (useGetTiposEvento as any).mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Debería devolver valores por defecto seguros si no hay registro activo', () => {
    const { result } = renderHook(() => useTerminalHistoryData(undefined, false));

    expect(result.current.totalEventos).toBe(0);
    expect(result.current.hasMultipleEvents).toBe(false);
    expect(result.current.eventosVisibles).toEqual([]);
  });

  it('Debería mapear correctamente el nombre del tipo de evento si existe en el maestro', () => {
    (useGetTiposEvento as any).mockReturnValue({
      data: [{ id: 99, tipo: 'Mantenimiento Preventivo' }],
    });

    const mockRegistro = {
      eventos: [
        { idEvento: 'EV-1', idTipoEvento: 99, inicio: '2023-01-01T10:00:00Z' }
      ]
    } as any;

    const { result } = renderHook(() => useTerminalHistoryData(mockRegistro, true));

    expect(result.current.eventosVisibles[0].tipoEvento).toBe('Mantenimiento Preventivo');
  });

  it('Debería ordenar los eventos del más reciente al más antiguo', () => {
    const mockRegistro = {
      eventos: [
        { idEvento: 'EV-VIEJO', inicio: '2023-01-01T10:00:00Z' },
        { idEvento: 'EV-NUEVO', inicio: '2023-01-01T15:00:00Z' }, 
      ]
    } as any;

    const { result } = renderHook(() => useTerminalHistoryData(mockRegistro, true));

    expect(result.current.totalEventos).toBe(2);
    expect(result.current.eventosVisibles[0].id).toBe('EV-NUEVO');
    expect(result.current.eventosVisibles[1].id).toBe('EV-VIEJO');
  });

  it('Debería respetar el parámetro isHistoryExpanded (paginación/acordeón)', () => {
    const mockRegistro = {
      eventos: [
        { idEvento: 'EV-1', inicio: '2023-01-01T15:00:00Z' },
        { idEvento: 'EV-2', inicio: '2023-01-01T10:00:00Z' },
      ]
    } as any;

    const { result, rerender } = renderHook(
      ({ expanded }) => useTerminalHistoryData(mockRegistro, expanded),
      { initialProps: { expanded: false } }
    );

    expect(result.current.hasMultipleEvents).toBe(true); 
    expect(result.current.totalEventos).toBe(2);
    expect(result.current.eventosVisibles).toHaveLength(1); 

    rerender({ expanded: true });

    expect(result.current.eventosVisibles).toHaveLength(2); 
  });

  it('Debería arrancar el temporizador en vivo para eventos sin fecha de fin', () => {
    vi.useFakeTimers();
    
    const hace10Segundos = new Date(Date.now() - 10000).toISOString();
    
    const mockRegistro = {
      eventos: [
        { idEvento: 'EV-LIVE', inicio: hace10Segundos }
      ]
    } as any;

    const { result } = renderHook(() => useTerminalHistoryData(mockRegistro, true));

    const duracionInicial = result.current.eventosVisibles[0].duracionMs!;
    expect(duracionInicial).toBeGreaterThanOrEqual(9900);

    // SOLUCIÓN: Envolvemos el salto temporal en act() para que React re-renderice
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const duracionActualizada = result.current.eventosVisibles[0].duracionMs!;
    expect(duracionActualizada).toBeGreaterThan(duracionInicial);
    expect(duracionActualizada - duracionInicial).toBeGreaterThanOrEqual(4900);
  });
});