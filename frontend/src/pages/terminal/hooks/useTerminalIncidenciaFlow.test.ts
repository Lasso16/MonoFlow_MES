import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTerminalIncidenciaFlow } from './useTerminalIncidenciaFlow';

const mockRegistrarIncidencia = { mutate: vi.fn(), isPending: false } as any;
const mockRegistrarEvento = { mutate: vi.fn(), isPending: false } as any;
const mockOnError = vi.fn();

const simulateSuccessResponse = (_vars: any, options?: { onSuccess?: () => void }) => {
  if (options?.onSuccess) options.onSuccess();
};

const baseProps = {
  operacionId: 'OP-123',
  operacionEstado: 'En curso',
  hasRegistroActivo: true,
  currentEventType: 2,
  eventosRegistro: [],
  registrarIncidenciaMutation: mockRegistrarIncidencia,
  registrarEventoMutation: mockRegistrarEvento,
  onError: mockOnError,
};

describe('Hook: useTerminalIncidenciaFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegistrarIncidencia.mutate.mockImplementation(simulateSuccessResponse);
    mockRegistrarEvento.mutate.mockImplementation(simulateSuccessResponse);
  });

  it('Debería iniciar con valores por defecto y sin incidencia activa', () => {
    const { result } = renderHook(() => useTerminalIncidenciaFlow(baseProps));

    expect(result.current.isIncidenciaActiva).toBe(false);
    expect(result.current.isIncidenciaDialogOpen).toBe(false);
  });

  it('No debería abrir el diálogo si no hay registro activo', () => {
    const { result } = renderHook(() => 
      useTerminalIncidenciaFlow({ ...baseProps, hasRegistroActivo: false })
    );

    act(() => { result.current.handleOpenIncidenciaDialog(); });

    expect(result.current.isIncidenciaDialogOpen).toBe(false);
  });

  it('Debería detectar una incidencia activa si el estado del backend lo indica', () => {
    const { result } = renderHook(() => 
      useTerminalIncidenciaFlow({ ...baseProps, operacionEstado: 'Incidencia grave' })
    );

    expect(result.current.isIncidenciaActiva).toBe(true);
  });

  it('Debería detectar una incidencia activa basándose en el historial de eventos', () => {
    const propsConIncidencia = {
      ...baseProps,
      eventosRegistro: [
        { idTipoEvento: 1, inicio: '2023-01-01T10:00:00', fin: '2023-01-01T10:15:00' },
        { idTipoEvento: 3, inicio: '2023-01-01T10:15:00' }
      ]
    };

    const { result } = renderHook(() => useTerminalIncidenciaFlow(propsConIncidencia));

    expect(result.current.isIncidenciaActiva).toBe(true);
  });

  it('Debería reportar una incidencia correctamente y actualizar el estado', () => {
    const { result } = renderHook(() => useTerminalIncidenciaFlow(baseProps));

    act(() => { result.current.handleOpenIncidenciaDialog(); });
    expect(result.current.isIncidenciaDialogOpen).toBe(true);

    act(() => {
      result.current.setSelectedIncidenciaId('5');
      result.current.setIncidenciaComentario('Falta de material');
    });

    act(() => { result.current.handleConfirmIncidencia(); });

    expect(mockRegistrarIncidencia.mutate).toHaveBeenCalledWith(
      {
        operacionId: 'OP-123',
        payload: { idTipoIncidencia: 5, comentario: 'Falta de material' }
      },
      expect.any(Object)
    );

    expect(result.current.isIncidenciaDialogOpen).toBe(false);
    expect(result.current.isIncidenciaActiva).toBe(true);
  });

  it('Debería reanudar la operación volviendo al evento anterior (Ejecución -> 2)', () => {
    const props = {
      ...baseProps,
      eventosRegistro: [
        { idTipoEvento: 1, inicio: '2023-01-01T08:00:00', fin: '2023-01-01T09:00:00' },
        { idTipoEvento: 2, inicio: '2023-01-01T09:00:00', fin: '2023-01-01T10:00:00' },
        { idTipoEvento: 3, inicio: '2023-01-01T10:00:00' }
      ]
    };

    const { result, rerender } = renderHook(
      (currentProps) => useTerminalIncidenciaFlow(currentProps), 
      { initialProps: props }
    );

    act(() => {
      result.current.handleResumeIncidencia();
    });

    expect(mockRegistrarEvento.mutate).toHaveBeenCalledWith(
      { operacionId: 'OP-123', payload: { idTipoEvento: 2 } },
      expect.any(Object)
    );
    
    rerender({
      ...props,
      eventosRegistro: [
        { idTipoEvento: 1, inicio: '2023-01-01T08:00:00', fin: '2023-01-01T09:00:00' },
        { idTipoEvento: 2, inicio: '2023-01-01T09:00:00', fin: '2023-01-01T10:00:00' },
        { idTipoEvento: 3, inicio: '2023-01-01T10:00:00', fin: '2023-01-01T10:30:00' }
      ]
    });

    expect(result.current.isIncidenciaActiva).toBe(false); 
  });

  it('Debería limpiar los estados internos si cambia la operación seleccionada', () => {
    const { result, rerender } = renderHook(
      (props) => useTerminalIncidenciaFlow(props),
      { initialProps: baseProps }
    );

    act(() => {
      result.current.handleOpenIncidenciaDialog();
      result.current.setIncidenciaComentario('Borrador...');
    });

    act(() => {
      rerender({ ...baseProps, operacionId: 'OP-999' });
    });

    expect(result.current.isIncidenciaDialogOpen).toBe(false);
    expect(result.current.incidenciaComentario).toBe('');
  });
});