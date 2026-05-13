import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTerminalOrchestrator } from './useTerminalOrchestrator';

vi.mock('../../../hooks/queries/useRegistroTrabajoQueries', () => ({
  useRegistroTrabajoMutations: vi.fn(() => ({
    registrarEventoMutation: {},
    registrarIncidenciaMutation: {},
    registrarProduccionMutation: {},
    registrarRechazoMutation: {},
    abrirRegistroTrabajoMutation: {},
    finalizarRegistroTrabajoMutation: {},
    addObservacionRegistroTrabajoMutation: {},
  })),
}));

vi.mock('./useTerminalData', () => ({
  useTerminalData: vi.fn(),
}));

vi.mock('./useTerminalRegistroState', () => ({
  useTerminalRegistroState: vi.fn(),
}));

vi.mock('./useTerminalPauseFlow', () => ({
  useTerminalPauseFlow: vi.fn(() => ({ isPausaActiva: false })),
}));

vi.mock('./useTerminalIncidenciaFlow', () => ({
  useTerminalIncidenciaFlow: vi.fn(),
}));

vi.mock('./useTerminalProduccionFlow', () => ({
  useTerminalProduccionFlow: vi.fn(() => ({ handleOpenProduccionDialog: vi.fn() })),
}));

vi.mock('./useTerminalAccionesFlow', () => ({
  useTerminalAccionesFlow: vi.fn(() => ({ handleAllOperariosRemoved: vi.fn() })),
}));

vi.mock('../terminalPropsBuilder', () => ({
  buildTerminalProps: vi.fn(() => ({
    terminalControlsProps: { soyUnControl: true },
    dialogsProps: { soyUnDialogo: true },
  })),
}));

import { useTerminalData } from './useTerminalData';
import { useTerminalRegistroState } from './useTerminalRegistroState';
import { useTerminalIncidenciaFlow } from './useTerminalIncidenciaFlow';

describe('Hook: useTerminalOrchestrator', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTerminalData).mockReturnValue({
      operacion: { id: 'OP-1', estado: 'Pendiente' },
      tiposIncidencia: [],
      tiposRechazoNormalizados: [],
    } as any);

    vi.mocked(useTerminalRegistroState).mockReturnValue({
      operariosActivosRegistro: [],
      selectedOperarioIdsCount: 0,
    } as any);

    vi.mocked(useTerminalIncidenciaFlow).mockReturnValue({
      isIncidenciaDialogOpen: false,
      selectedIncidenciaId: '',
      setSelectedIncidenciaId: vi.fn(),
    } as any);
  });

  it('Debería empaquetar correctamente las props para la interfaz gráfica', () => {
    const { result } = renderHook(() => useTerminalOrchestrator('OP-1', mockNavigate));

    expect(result.current.dialogsProps).toEqual({ soyUnDialogo: true });
    expect(result.current.mainContentProps.controlsProps).toEqual({ soyUnControl: true });
    
    expect(result.current.mainContentProps.operacionData.operacionEstado).toBe('Pendiente');
    
    result.current.mainContentProps.selectorProps.onClearOperacion();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('Debería limpiar los operarios seleccionados y desbloquear el equipo si cambia la operación (ID)', () => {
    const { result, rerender } = renderHook(
      ({ id }) => useTerminalOrchestrator(id, mockNavigate),
      { initialProps: { id: 'OP-1' } }
    );

    act(() => {
      result.current.mainContentProps.teamProps.onSelectedOperariosChange([{ id: 'OPR-1', nombre: 'Juan' } as any]);
      result.current.mainContentProps.teamProps.onTeamLockedChange(true);
    });

    expect(result.current.mainContentProps.teamProps.selectedOperarios).toHaveLength(1);
    expect(result.current.mainContentProps.teamProps.isTeamLocked).toBe(true);

    act(() => {
      rerender({ id: 'OP-2' });
    });

    expect(result.current.mainContentProps.teamProps.selectedOperarios).toHaveLength(0);
    expect(result.current.mainContentProps.teamProps.isTeamLocked).toBe(false);
  });

  it('Debería autoseleccionar el primer tipo de incidencia si se abre el diálogo y no hay ninguna seleccionada', () => {
    const mockSetSelectedIncidenciaId = vi.fn();

    vi.mocked(useTerminalData).mockReturnValue({
      tiposIncidencia: [{ id: 99, descripcion: 'Fallo eléctrico' }],
    } as any);

    vi.mocked(useTerminalIncidenciaFlow).mockReturnValue({
      isIncidenciaDialogOpen: true,
      selectedIncidenciaId: '',     
      setSelectedIncidenciaId: mockSetSelectedIncidenciaId,
    } as any);

    renderHook(() => useTerminalOrchestrator('OP-1', mockNavigate));

    expect(mockSetSelectedIncidenciaId).toHaveBeenCalledWith('99');
  });
});