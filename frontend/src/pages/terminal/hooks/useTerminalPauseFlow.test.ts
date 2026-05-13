import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTerminalPauseFlow } from './useTerminalPauseFlow';

const mockRegistrarEvento = { mutate: vi.fn(), isPending: false } as any;
const mockAddObservacion = { mutate: vi.fn(), isPending: false } as any;
const mockOnError = vi.fn();

const simulateSuccessResponse = (_vars: any, options?: { onSuccess?: () => void }) => {
  if (options && options.onSuccess) {
    options.onSuccess();
  }
};

const baseProps = {
  operacionId: 'OP-456',
  hasRegistroActivo: true,
  eventosRegistro: [],
  registrarEventoMutation: mockRegistrarEvento,
  addObservacionMutation: mockAddObservacion,
  onError: mockOnError,
};

describe('Hook: useTerminalPauseFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegistrarEvento.mutate.mockImplementation(simulateSuccessResponse);
    mockAddObservacion.mutate.mockImplementation(simulateSuccessResponse);
  });

  it('Debería iniciar como "no pausado" si no hay eventos', () => {
    const { result } = renderHook(() => useTerminalPauseFlow(baseProps));

    expect(result.current.isPausaActiva).toBe(false);
    expect(result.current.isPauseDialogOpen).toBe(false);
    expect(result.current.pauseReason).toBe('Almuerzo');
  });

  it('Debería detectar automáticamente si venimos del backend con una pausa activa', () => {
    const propsConPausa = {
      ...baseProps,
      eventosRegistro: [
        { idTipoEvento: 2, inicio: '2023-10-10T08:00:00' },
        { idTipoEvento: 4, inicio: '2023-10-10T10:00:00' } 
      ]
    };

    const { result } = renderHook(() => useTerminalPauseFlow(propsConPausa));

    expect(result.current.isPausaActiva).toBe(true);
  });

  it('Debería abrir el diálogo si pulsamos pausar y no estábamos en pausa', () => {
    const { result } = renderHook(() => useTerminalPauseFlow(baseProps));

    act(() => {
      result.current.handlePauseAction();
    });

    expect(result.current.isPauseDialogOpen).toBe(true);
    expect(mockRegistrarEvento.mutate).not.toHaveBeenCalled();
  });

  it('Debería enviar el evento 4 (Pausa) al confirmar el diálogo', () => {
    const { result } = renderHook(() => useTerminalPauseFlow(baseProps));

    act(() => {
      result.current.handleConfirmPause();
    });

    expect(mockRegistrarEvento.mutate).toHaveBeenCalledWith(
      { operacionId: 'OP-456', payload: { idTipoEvento: 4 } },
      expect.any(Object)
    );

    expect(result.current.isPausaActiva).toBe(true);
    expect(result.current.isPauseDialogOpen).toBe(false);
  });

  it('Debería reanudar el trabajo (guardar observación y volver al evento anterior) si ya estábamos en pausa', () => {
    const propsConPausa = {
      ...baseProps,
      eventosRegistro: [
        { idTipoEvento: 2, inicio: '2023-10-10T08:00:00' },
        { idTipoEvento: 4, inicio: '2023-10-10T10:00:00' }
      ]
    };

    const { result } = renderHook(() => useTerminalPauseFlow(propsConPausa));

    act(() => {
      result.current.handlePauseAction();
    });

    expect(mockAddObservacion.mutate).toHaveBeenCalledWith(
      { 
        operacionId: 'OP-456', 
        method: 'POST', 
        payload: { observacion: expect.stringContaining('Pausa: Almuerzo') } 
      },
      expect.any(Object)
    );

    expect(mockRegistrarEvento.mutate).toHaveBeenCalledWith(
      { operacionId: 'OP-456', payload: { idTipoEvento: 2 } },
      expect.any(Object)
    );

    expect(result.current.isPausaActiva).toBe(false);
  });

  it('No debería hacer nada si hasRegistroActivo es false', () => {
    const { result } = renderHook(() => useTerminalPauseFlow({ ...baseProps, hasRegistroActivo: false }));

    act(() => {
      result.current.handlePauseAction();
    });

    expect(result.current.isPauseDialogOpen).toBe(false);
  });
});