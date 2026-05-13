import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTerminalAccionesFlow } from './useTerminalAccionesFlow';
import { getEstadoKind } from '../../../utils/estadoArticulosUtils';

vi.mock('../../../utils/estadoArticulosUtils', () => ({
  getEstadoKind: vi.fn(),
}));

const mockAbrirRegistro = { mutate: vi.fn() } as any;
const mockRegistrarEvento = { mutate: vi.fn() } as any;
const mockFinalizarRegistro = { mutateAsync: vi.fn() } as any;
const mockAddObservacion = { mutate: vi.fn() } as any;

const mockHandleOpenProduccion = vi.fn();
const mockOnError = vi.fn();
const mockSetIsTeamLocked = vi.fn();
const mockNavigate = vi.fn();

const simulateSuccessResponse = (_vars: any, options?: { onSuccess?: () => void }) => {
  if (options?.onSuccess) options.onSuccess();
};

const baseProps = {
  operacionId: 'OP-1',
  equipoCount: 2,
  hasRegistroActivo: false,
  isPausaActiva: false,
  selectedOperarioIds: ['OPR-1', 'OPR-2'],
  operariosActivosRegistro: [{ id: 'OPR-1' }, { id: 'OPR-2' }],
  nextEventoTipo: 1,
  registroActualOperacion: {},
  operacionEstado: 1,
  hasOperacionSeleccionada: true,
  abrirRegistroTrabajoMutation: mockAbrirRegistro,
  registrarEventoMutation: mockRegistrarEvento,
  finalizarRegistroTrabajoMutation: mockFinalizarRegistro,
  addObservacionMutation: mockAddObservacion,
  handleOpenProduccionDialog: mockHandleOpenProduccion,
  onError: mockOnError,
  setIsTeamLocked: mockSetIsTeamLocked,
  navigate: mockNavigate,
};

describe('Hook: useTerminalAccionesFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAbrirRegistro.mutate.mockImplementation(simulateSuccessResponse);
    mockFinalizarRegistro.mutateAsync.mockResolvedValue({}); 
  });

  it('Debería iniciar un nuevo registro si no hay uno activo', () => {
    const { result } = renderHook(() => useTerminalAccionesFlow(baseProps));

    act(() => {
      result.current.handleIniciarRegistro();
    });

    expect(mockAbrirRegistro.mutate).toHaveBeenCalledWith(
      { operacionId: 'OP-1', payload: { idOperarios: ['OPR-1', 'OPR-2'] } },
      expect.any(Object)
    );

    expect(mockSetIsTeamLocked).not.toHaveBeenCalledWith(true);
    expect(mockRegistrarEvento.mutate).toHaveBeenCalledWith(
      { operacionId: 'OP-1', payload: { idTipoEvento: 1 } }
    );
  });

  it('Debería avanzar de evento si ya hay un registro activo', () => {
    const props = { ...baseProps, hasRegistroActivo: true, nextEventoTipo: 2 };
    const { result } = renderHook(() => useTerminalAccionesFlow(props));

    act(() => {
      result.current.handleIniciarRegistro();
    });

    expect(mockAbrirRegistro.mutate).not.toHaveBeenCalled();
    expect(mockRegistrarEvento.mutate).toHaveBeenCalledWith(
      { operacionId: 'OP-1', payload: { idTipoEvento: 2 } }
    );
  });

  it('Debería abrir el diálogo de producción si el siguiente evento es Recogida (5)', () => {
    const props = { ...baseProps, hasRegistroActivo: true, nextEventoTipo: 5 };
    const { result } = renderHook(() => useTerminalAccionesFlow(props));

    act(() => {
      result.current.handleIniciarRegistro();
    });

    expect(mockRegistrarEvento.mutate).not.toHaveBeenCalled();
    expect(mockHandleOpenProduccion).toHaveBeenCalledWith(true);
  });

  it('Debería finalizar el registro asíncronamente y redirigir al inicio', async () => {
    const { result } = renderHook(() => useTerminalAccionesFlow(baseProps));

    await act(async () => {
      await result.current.handleFinalizarRegistro();
    });

    expect(mockFinalizarRegistro.mutateAsync).toHaveBeenCalledWith({
      operacionId: 'OP-1',
      operarioIds: ['OPR-1', 'OPR-2'],
    });
    expect(mockSetIsTeamLocked).toHaveBeenCalledWith(false);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('Debería gestionar el flujo de enviar una observación', () => {
    const props = { ...baseProps, hasRegistroActivo: true };
    const { result } = renderHook(() => useTerminalAccionesFlow(props));

    act(() => { result.current.handleOpenObservacionDialog(); });
    expect(result.current.isObservacionDialogOpen).toBe(true);

    act(() => { result.current.setObservacionText("Falta material"); });

    act(() => { result.current.handleConfirmObservacion(); });

    expect(mockAddObservacion.mutate).toHaveBeenCalledWith(
      { operacionId: 'OP-1', method: 'POST', payload: { observacion: 'Falta material' } },
      expect.any(Object)
    );
    expect(result.current.isObservacionDialogOpen).toBe(false);
    expect(result.current.observacionText).toBe("");
  });

  it('Debería permitir seguir interactuando después de eliminar todos los operarios', () => {
    // @ts-ignore
    vi.mocked(getEstadoKind).mockReturnValue("encurso");

    const { rerender } = renderHook(
      (props) => useTerminalAccionesFlow(props), 
      { initialProps: baseProps }
    );

    const propsEmpty = { ...baseProps, operariosActivosRegistro: [] };
    
    act(() => {
      rerender(propsEmpty);
    });

    // No debería redirigir ni cambiar isTeamLocked cuando se eliminan operarios
    // para permitir que el usuario siga interactuando en TeamManagementCard
    expect(mockSetIsTeamLocked).not.toHaveBeenCalledWith(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});