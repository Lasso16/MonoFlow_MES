import { getEstadoKind } from '../../utils/estadoArticulosUtils';

type BuildPropsArgs = {
  hasOperacionSeleccionada: boolean;
  equipoCount: number;
  hasRegistroActivo: boolean;
  nextEventoTipo: number | null;
  currentEventType: number | null;
  isPausaActiva: boolean;
  isIncidenciaActiva: boolean;
  hasRecogida: boolean;
  startActionLabel: string;
  isLoadingTiposIncidencia: boolean;
  isLoadingTiposRechazo: boolean;
  tiposIncidencia: any[];
  tiposRechazoNormalizados: any[];
  registroErrorAviso: string | null;
  setRegistroErrorAviso: (msg: string | null) => void;
  operacionEstado?: string | number | null;

  // Acciones
  handleIniciarRegistro: () => void;
  handleOpenIncidenciaDialog: () => void;
  handleOpenObservacionDialog: () => void;
  handleOpenProduccionDialog: (forAvance?: boolean) => void;
  handlePauseAction: () => void;
  handleResumeIncidencia: () => void;
  handleFinalizarRegistro: () => void;
  
  // Diálogos
  isPauseDialogOpen: boolean;
  pauseReason: string;
  setIsPauseDialogOpen: (o: boolean) => void;
  setPauseReason: (r: string) => void;
  handleConfirmPause: () => void;
  isObservacionDialogOpen: boolean;
  observacionText: string;
  setIsObservacionDialogOpen: (o: boolean) => void;
  setObservacionText: (t: string) => void;
  handleConfirmObservacion: () => void;
  isIncidenciaDialogOpen: boolean;
  selectedIncidenciaId: string;
  incidenciaComentario: string;
  setIsIncidenciaDialogOpen: (o: boolean) => void;
  setSelectedIncidenciaId: (id: string) => void;
  setIncidenciaComentario: (c: string) => void;
  handleConfirmIncidencia: () => void;
  isProduccionDialogOpen: boolean;
  piezasBuenasText: string;
  piezasRechazadasText: string;
  selectedRechazoId: string;
  rechazoComentario: string;
  setIsProduccionDialogOpen: (o: boolean) => void;
  setPiezasBuenasText: (t: string) => void;
  setPiezasRechazadasText: (t: string) => void;
  setSelectedRechazoId: (id: string) => void;
  setRechazoComentario: (c: string) => void;
  handleConfirmProduccion: () => void;
};

export const buildTerminalProps = (args: BuildPropsArgs) => {
  const isCurrentPauseEvent = args.currentEventType === 4 || args.isPausaActiva;
  const isCurrentIncidenciaEvent = args.currentEventType === 3 || args.isIncidenciaActiva;
  const isEnCursoRemoto = !args.hasRegistroActivo && getEstadoKind(args.operacionEstado) === 'enejecucion';

  const terminalControlsProps = {
    onStart: args.handleIniciarRegistro,
    startLabel: args.startActionLabel,
    isIniciarDisabled: !args.hasOperacionSeleccionada || args.equipoCount === 0 || (args.hasRegistroActivo && args.nextEventoTipo === null) || isCurrentPauseEvent || isCurrentIncidenciaEvent || isEnCursoRemoto,
    isIniciarLoading: false,
    onIncident: args.handleOpenIncidenciaDialog,
    isIncidentDisabled: !args.hasOperacionSeleccionada || !args.hasRegistroActivo || isCurrentPauseEvent || isCurrentIncidenciaEvent,
    isIncidentLoading: args.isLoadingTiposIncidencia,
    onNote: args.handleOpenObservacionDialog,
    isNoteDisabled: !args.hasOperacionSeleccionada || !args.hasRegistroActivo || isCurrentPauseEvent || isCurrentIncidenciaEvent,
    isNoteLoading: false,
    onProduce: () => args.handleOpenProduccionDialog(false),
    isProduceDisabled: !args.hasOperacionSeleccionada || !args.hasRegistroActivo || isCurrentPauseEvent || isCurrentIncidenciaEvent,
    isProduceLoading: args.isLoadingTiposRechazo,
    onPause: isCurrentPauseEvent ? args.handlePauseAction : isCurrentIncidenciaEvent ? args.handleResumeIncidencia : args.handlePauseAction,
    pauseLabel: isCurrentPauseEvent || isCurrentIncidenciaEvent ? "Reanudar trabajo" : "Pausar",
    isPauseDisabled: !args.hasOperacionSeleccionada || !args.hasRegistroActivo,
    isPauseLoading: false,
    showFinalizar: args.hasRegistroActivo && args.hasRecogida && !isCurrentPauseEvent,
    onFinalizar: args.handleFinalizarRegistro,
    isFinalizarDisabled: !args.hasOperacionSeleccionada || isCurrentPauseEvent,
    isFinalizarLoading: false,
    isAllDisabled: !args.hasOperacionSeleccionada,
    lockNonPauseActions: isCurrentPauseEvent || isCurrentIncidenciaEvent,
    allowIncidentWhenLocked: isCurrentIncidenciaEvent,
  };

  const dialogsProps = {
    snackbarProps: { message: args.registroErrorAviso, onClose: () => args.setRegistroErrorAviso(null) },
    pauseDialogProps: { open: args.isPauseDialogOpen, pauseReason: args.pauseReason, onClose: () => args.setIsPauseDialogOpen(false), onPauseReasonChange: args.setPauseReason, onConfirm: args.handleConfirmPause, isConfirmLoading: false },
    observacionDialogProps: { open: args.isObservacionDialogOpen, observacion: args.observacionText, onClose: () => args.setIsObservacionDialogOpen(false), onObservacionChange: args.setObservacionText, onConfirm: args.handleConfirmObservacion, isConfirmLoading: false },
    incidenciaDialogProps: { open: args.isIncidenciaDialogOpen, incidencias: args.tiposIncidencia, selectedIncidenciaId: args.selectedIncidenciaId, comentario: args.incidenciaComentario, onClose: () => args.setIsIncidenciaDialogOpen(false), onSelectedIncidenciaIdChange: args.setSelectedIncidenciaId, onComentarioChange: args.setIncidenciaComentario, onConfirm: args.handleConfirmIncidencia, isConfirmLoading: false },
    produccionDialogProps: { open: args.isProduccionDialogOpen, piezasBuenas: args.piezasBuenasText, piezasRechazadas: args.piezasRechazadasText, selectedRechazoId: args.selectedRechazoId, rechazoComentario: args.rechazoComentario, tiposRechazo: args.tiposRechazoNormalizados, onClose: () => args.setIsProduccionDialogOpen(false), onPiezasBuenasChange: args.setPiezasBuenasText, onPiezasRechazadasChange: args.setPiezasRechazadasText, onSelectedRechazoIdChange: args.setSelectedRechazoId, onRechazoComentarioChange: args.setRechazoComentario, onConfirm: args.handleConfirmProduccion, isConfirmLoading: false }
  };

  return { terminalControlsProps, dialogsProps };
};