import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTerminalProduccionFlow } from './useTerminalProduccionFlow';

const mockRegistrarProduccion = { mutate: vi.fn() } as any;
const mockRegistrarRechazo = { mutate: vi.fn() } as any;
const mockRegistrarEvento = { mutate: vi.fn() } as any;
const mockOnError = vi.fn();

const mockTiposRechazo = [{ id: 10, descripcion: 'Defecto visual' }];
const baseProps = {
  operacionId: 'OP-123',
  nextEventoTipo: 2,
  registrarProduccionMutation: mockRegistrarProduccion,
  registrarRechazoMutation: mockRegistrarRechazo,
  registrarEventoMutation: mockRegistrarEvento,
  onError: mockOnError,
  tiposRechazoNormalizados: mockTiposRechazo,
};

describe('Hook: useTerminalProduccionFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debería iniciar con el diálogo cerrado y variables vacías', () => {
    const { result } = renderHook(() => useTerminalProduccionFlow(baseProps));

    expect(result.current.isProduccionDialogOpen).toBe(false);
    expect(result.current.piezasBuenasText).toBe("");
    expect(result.current.isAvancePendiente).toBe(false);
  });

  it('Debería abrir el diálogo y el motivo de rechazo debe estar vacío por defecto', () => {
    const { result } = renderHook(() => useTerminalProduccionFlow(baseProps));

    act(() => {
      result.current.handleOpenProduccionDialog(false);
    });

    expect(result.current.isProduccionDialogOpen).toBe(true);
    expect(result.current.isAvancePendiente).toBe(false);
    expect(result.current.selectedRechazoId).toBe("");
  });

  it('Debería registrar SÓLO piezas buenas si no hay rechazos', () => {
    const { result } = renderHook(() => useTerminalProduccionFlow(baseProps));

    act(() => {
      result.current.handleOpenProduccionDialog(false);
    });

    act(() => {
      result.current.setPiezasBuenasText("15");
    });

    act(() => {
      result.current.handleConfirmProduccion();
    });

    expect(mockRegistrarProduccion.mutate).toHaveBeenCalledWith(
      { operacionId: 'OP-123', payload: { cantidad: 15 } },
      expect.any(Object)
    );
    
    expect(mockRegistrarRechazo.mutate).not.toHaveBeenCalled();
    expect(mockRegistrarEvento.mutate).not.toHaveBeenCalled();

    expect(result.current.isProduccionDialogOpen).toBe(false);
  });

  it('Debería registrar rechazos con su comentario', () => {
    const { result } = renderHook(() => useTerminalProduccionFlow(baseProps));

    act(() => {
      result.current.handleOpenProduccionDialog(false);
    });

    act(() => {
      result.current.setPiezasRechazadasText("3");
      result.current.setSelectedRechazoId("10");
      result.current.setRechazoComentario("Arañazo lateral");
    });

    act(() => {
      result.current.handleConfirmProduccion();
    });

    expect(mockRegistrarRechazo.mutate).toHaveBeenCalledWith(
      {
        operacionId: 'OP-123',
        payload: { cantidad: 3, idTipoRechazo: 10, comentario: "Arañazo lateral" }
      },
      expect.any(Object)
    );
    expect(mockRegistrarProduccion.mutate).not.toHaveBeenCalled();
  });

  it('Debería lanzar la mutación de evento si forAvance es true', () => {
    const { result } = renderHook(() => useTerminalProduccionFlow(baseProps));

    act(() => {
      result.current.handleOpenProduccionDialog(true);
    });

    expect(result.current.isAvancePendiente).toBe(true);

    act(() => {
      result.current.handleConfirmProduccion();
    });

    expect(mockRegistrarEvento.mutate).toHaveBeenCalledWith(
      { operacionId: 'OP-123', payload: { idTipoEvento: 2 } },
      expect.any(Object)
    );
  });

  it('No debería hacer nada si no se introducen cantidades (todo a 0)', () => {
    const { result } = renderHook(() => useTerminalProduccionFlow(baseProps));

    act(() => {
      result.current.handleOpenProduccionDialog(false);
    });

    act(() => {
      result.current.handleConfirmProduccion();
    });

    expect(mockRegistrarProduccion.mutate).not.toHaveBeenCalled();
    expect(mockRegistrarRechazo.mutate).not.toHaveBeenCalled();
    expect(mockRegistrarEvento.mutate).not.toHaveBeenCalled();
  });
});