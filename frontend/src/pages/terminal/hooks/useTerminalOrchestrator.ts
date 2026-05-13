import { useCallback, useEffect, useMemo, useState } from "react";
import { useRegistroTrabajoMutations } from "../../../hooks/queries/useRegistroTrabajoQueries";
import type { Operario } from "../../../model/aggregates/Operarios";
import { useTerminalIncidenciaFlow } from "./useTerminalIncidenciaFlow";
import { useTerminalPauseFlow } from "./useTerminalPauseFlow";
import { useTerminalProduccionFlow } from "./useTerminalProduccionFlow";
import { useTerminalAccionesFlow } from "./useTerminalAccionesFlow";
import { useTerminalRegistroState } from "./useTerminalRegistroState";
import { useTerminalData } from "./useTerminalData";
import { buildTerminalProps } from "../terminalPropsBuilder";

export const useTerminalOrchestrator = (id: string | undefined, navigate: (path: string) => void) => {
  const hasOperacionSeleccionada = Boolean(id);

  const [selectedOperarios, setSelectedOperarios] = useState<Operario[]>([]);
  const [isTeamLocked, setIsTeamLocked] = useState(false);
  const [registroErrorAviso, setRegistroErrorAviso] = useState<string | null>(null);

  const selectedOperarioIds = useMemo(() => selectedOperarios.map((o) => o.id), [selectedOperarios]);

  useEffect(() => {
    setSelectedOperarios([]);
    setIsTeamLocked(false);
  }, [id]);

  const mutations = useRegistroTrabajoMutations();

  const {
    operacion, progreso, tiposIncidencia, tiposRechazoNormalizados, registroActualOperacion,
    articulo, orden, isLoadingTiposIncidencia, isLoadingTiposRechazo,
    isLoadingRegistroActualOperacion, isErrorRegistroActualOperacion, operacionLoadErrorMessage,
  } = useTerminalData(id);

  // --- NUEVA LÓGICA DE SINCRONIZACIÓN ---
  useEffect(() => {
    const sesiones = registroActualOperacion?.sesionesActivas || registroActualOperacion?.SesionesActivas;

    if (sesiones && sesiones.length > 0) {
      const operariosDesdeSesiones = sesiones.map(s => s.operario).filter(Boolean);
      setSelectedOperarios(operariosDesdeSesiones);
    }
  }, [registroActualOperacion?.idRegistro, registroActualOperacion?.sesionesActivas, registroActualOperacion?.SesionesActivas]);

  const {
    operariosActivosRegistro, hasRegistroActivo, equipoCount, hasRecogida, nextEventoTipo,
    startActionLabel, currentEventType,
  } = useTerminalRegistroState({ registroActualOperacion, selectedOperarioIdsCount: selectedOperarioIds.length });

  const pauseFlow = useTerminalPauseFlow({
    operacionId: id, hasRegistroActivo, eventosRegistro: registroActualOperacion?.eventos ?? [],
    registrarEventoMutation: mutations.registrarEventoMutation, addObservacionMutation: mutations.addObservacionRegistroTrabajoMutation, onError: setRegistroErrorAviso,
  });

  const incidenciaFlow = useTerminalIncidenciaFlow({
    operacionId: id, operacionEstado: operacion?.estado, hasRegistroActivo, currentEventType,
    eventosRegistro: registroActualOperacion?.eventos ?? [], registrarIncidenciaMutation: mutations.registrarIncidenciaMutation,
    registrarEventoMutation: mutations.registrarEventoMutation, onError: setRegistroErrorAviso,
  });

  useEffect(() => {
    if (!incidenciaFlow.isIncidenciaDialogOpen || incidenciaFlow.selectedIncidenciaId || tiposIncidencia.length === 0) return;
    incidenciaFlow.setSelectedIncidenciaId(String(tiposIncidencia[0].id));
  }, [incidenciaFlow.isIncidenciaDialogOpen, incidenciaFlow.selectedIncidenciaId, tiposIncidencia, incidenciaFlow.setSelectedIncidenciaId]);

  const produccionFlow = useTerminalProduccionFlow({
    operacionId: id, nextEventoTipo, registrarProduccionMutation: mutations.registrarProduccionMutation,
    registrarRechazoMutation: mutations.registrarRechazoMutation, registrarEventoMutation: mutations.registrarEventoMutation,
    onError: setRegistroErrorAviso,
  });

  const accionesFlow = useTerminalAccionesFlow({
    operacionId: id, equipoCount, hasRegistroActivo, isPausaActiva: pauseFlow.isPausaActiva, selectedOperarioIds,
    operariosActivosRegistro, nextEventoTipo,
    registroActualOperacion, operacionEstado: operacion?.estado, hasOperacionSeleccionada,
    abrirRegistroTrabajoMutation: mutations.abrirRegistroTrabajoMutation,
    registrarEventoMutation: mutations.registrarEventoMutation,
    finalizarRegistroTrabajoMutation: mutations.finalizarRegistroTrabajoMutation,
    addObservacionMutation: mutations.addObservacionRegistroTrabajoMutation,
    handleOpenProduccionDialog: produccionFlow.handleOpenProduccionDialog,
    onError: setRegistroErrorAviso, setIsTeamLocked, navigate,
  });

  const teamProps = {
    selectedOperarios,
    onSelectedOperariosChange: setSelectedOperarios,
    isTeamLocked,
    hasProcesoIniciado: hasRegistroActivo,
    onTeamLockedChange: setIsTeamLocked,
    onAllOperariosRemoved: accionesFlow.handleAllOperariosRemoved,
  };

  const onSelectOperacion = useCallback((oId: string) => navigate(`/terminal/operacion/${oId}`), [navigate]);
  const onClearOperacion = useCallback(() => navigate("/"), [navigate]);

  const selectorProps = {
    selectedOperacionId: id,
    onSelectOperacion,
    onClearOperacion,
    hasOperacionSeleccionada,
  };

  const operacionData = {
    operacion, progreso, registroActualOperacion: registroActualOperacion ?? undefined,
    cliente: orden?.cliente, descripcionArticulo: articulo?.descripcion, operacionEstado: operacion?.estado,
  };

  const { terminalControlsProps, dialogsProps } = buildTerminalProps({
    hasOperacionSeleccionada, equipoCount, hasRegistroActivo, nextEventoTipo, currentEventType,
    hasRecogida, startActionLabel, isLoadingTiposIncidencia, isLoadingTiposRechazo,
    tiposIncidencia, tiposRechazoNormalizados, registroErrorAviso, setRegistroErrorAviso,
    operacionEstado: operacion?.estado,
    ...pauseFlow, ...accionesFlow, ...incidenciaFlow, ...produccionFlow
  });

  const historyProps = {
    operacionId: id, registroActualOperacion: registroActualOperacion ?? undefined,
    isRegistroActualOperacionLoading: isLoadingRegistroActualOperacion, isRegistroActualOperacionError: isErrorRegistroActualOperacion,
  };

  const mainContentProps = {
    selectorProps,
    teamProps,
    operacionData,
    controlsProps: terminalControlsProps,
    historyProps
  };

  return {
    operacionLoadErrorMessage,
    mainContentProps,
    dialogsProps
  };
};