import { describe, it, expect, vi } from 'vitest';
import { buildTerminalProps } from './terminalPropsBuilder';

const createBaseArgs = (overrides = {}) => ({
  hasOperacionSeleccionada: true,
  equipoCount: 2,
  hasRegistroActivo: true,
  nextEventoTipo: 2,
  currentEventType: 1,
  isPausaActiva: false,
  isIncidenciaActiva: false,
  hasRecogida: false,
  startActionLabel: 'Ejecucion',
  isLoadingTiposIncidencia: false,
  isLoadingTiposRechazo: false,
  tiposIncidencia: [],
  tiposRechazoNormalizados: [],
  registroErrorAviso: null,
  
  setRegistroErrorAviso: vi.fn(),
  handleIniciarRegistro: vi.fn(),
  handleOpenIncidenciaDialog: vi.fn(),
  handleOpenObservacionDialog: vi.fn(),
  handleOpenProduccionDialog: vi.fn(),
  handlePauseAction: vi.fn(),
  handleResumeIncidencia: vi.fn(),
  handleFinalizarRegistro: vi.fn(),
  setIsPauseDialogOpen: vi.fn(),
  setPauseReason: vi.fn(),
  handleConfirmPause: vi.fn(),
  setIsObservacionDialogOpen: vi.fn(),
  setObservacionText: vi.fn(),
  handleConfirmObservacion: vi.fn(),
  setIsIncidenciaDialogOpen: vi.fn(),
  setSelectedIncidenciaId: vi.fn(),
  setIncidenciaComentario: vi.fn(),
  handleConfirmIncidencia: vi.fn(),
  setIsProduccionDialogOpen: vi.fn(),
  setPiezasBuenasText: vi.fn(),
  setPiezasRechazadasText: vi.fn(),
  setSelectedRechazoId: vi.fn(),
  setRechazoComentario: vi.fn(),
  handleConfirmProduccion: vi.fn(),
    ...overrides,
} as any);

describe('Utilidad: buildTerminalProps', () => {

  it('Debería deshabilitar casi todo si no hay operación seleccionada', () => {
    const args = createBaseArgs({ hasOperacionSeleccionada: false });
    const { terminalControlsProps } = buildTerminalProps(args);

    expect(terminalControlsProps.isAllDisabled).toBe(true);
    expect(terminalControlsProps.isIniciarDisabled).toBe(true);
    expect(terminalControlsProps.isIncidentDisabled).toBe(true);
    expect(terminalControlsProps.isProduceDisabled).toBe(true);
  });

  it('Debería habilitar las acciones principales en un flujo normal activo', () => {
    const args = createBaseArgs({ 
      hasOperacionSeleccionada: true,
      hasRegistroActivo: true,
      isPausaActiva: false,
      isIncidenciaActiva: false
    });
    
    const { terminalControlsProps } = buildTerminalProps(args);

    expect(terminalControlsProps.isIniciarDisabled).toBe(false);
    expect(terminalControlsProps.isIncidentDisabled).toBe(false);
    expect(terminalControlsProps.isProduceDisabled).toBe(false);
    expect(terminalControlsProps.pauseLabel).toBe('Pausar');
    expect(terminalControlsProps.lockNonPauseActions).toBe(false);
  });

  it('Debería bloquear la pantalla y cambiar el botón a "Reanudar" si hay PAUSA', () => {
    const args = createBaseArgs({ isPausaActiva: true, currentEventType: 4 });
    const { terminalControlsProps } = buildTerminalProps(args);

    expect(terminalControlsProps.lockNonPauseActions).toBe(true);
    expect(terminalControlsProps.isIniciarDisabled).toBe(true);
    expect(terminalControlsProps.isProduceDisabled).toBe(true);
    
    expect(terminalControlsProps.pauseLabel).toBe('Reanudar trabajo');
    
    terminalControlsProps.onPause();
    expect(args.handlePauseAction).toHaveBeenCalled();
  });

  it('Debería bloquear la pantalla pero permitir gestionar la incidencia si hay INCIDENCIA', () => {
    const args = createBaseArgs({ isIncidenciaActiva: true, currentEventType: 3 });
    const { terminalControlsProps } = buildTerminalProps(args);

    expect(terminalControlsProps.lockNonPauseActions).toBe(true);
    expect(terminalControlsProps.allowIncidentWhenLocked).toBe(true);
    expect(terminalControlsProps.pauseLabel).toBe('Reanudar trabajo');

    terminalControlsProps.onPause();
    expect(args.handleResumeIncidencia).toHaveBeenCalled();
  });

  it('Debería mostrar el botón Finalizar solo si hay registro, recogida y no hay pausa', () => {
    const argsOk = createBaseArgs({ hasRegistroActivo: true, hasRecogida: true, isPausaActiva: false });
    expect(buildTerminalProps(argsOk).terminalControlsProps.showFinalizar).toBe(true);

    const argsPausado = createBaseArgs({ hasRegistroActivo: true, hasRecogida: true, isPausaActiva: true });
    expect(buildTerminalProps(argsPausado).terminalControlsProps.showFinalizar).toBe(false);
  });

  it('Debería empaquetar correctamente las propiedades de los diálogos', () => {
    const args = createBaseArgs({
      isPauseDialogOpen: true,
      pauseReason: 'Falta material',
      registroErrorAviso: 'Error de red'
    });
    
    const { dialogsProps } = buildTerminalProps(args);

    expect(dialogsProps.snackbarProps.message).toBe('Error de red');
    expect(dialogsProps.pauseDialogProps.open).toBe(true);
    expect(dialogsProps.pauseDialogProps.pauseReason).toBe('Falta material');
  });

});