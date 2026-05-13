import { useState, useEffect, useRef } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import { getEstadoKind } from "../../../utils/estadoArticulosUtils";

type Props = {
  operacionId?: string;
  equipoCount: number;
  hasRegistroActivo: boolean;
  isPausaActiva: boolean;
  selectedOperarioIds: string[];
  operariosActivosRegistro: any[];
  nextEventoTipo: number | null;
  registroActualOperacion: any;
  operacionEstado?: number | string;
  hasOperacionSeleccionada: boolean;
  abrirRegistroTrabajoMutation: UseMutationResult<any, Error, any>;
  registrarEventoMutation: UseMutationResult<any, Error, any>;
  finalizarRegistroTrabajoMutation: UseMutationResult<any, Error, any>;
  addObservacionMutation: UseMutationResult<any, Error, any>;
  handleOpenProduccionDialog: (forAvance?: boolean) => void;
  onError: (msg: string) => void;
  setIsTeamLocked: (locked: boolean) => void;
  navigate: (path: string, options?: any) => void;
};

export const useTerminalAccionesFlow = ({
  operacionId, equipoCount, hasRegistroActivo, isPausaActiva, selectedOperarioIds,
  operariosActivosRegistro, nextEventoTipo,
  registroActualOperacion: _registroActualOperacion, operacionEstado, hasOperacionSeleccionada,
  abrirRegistroTrabajoMutation, registrarEventoMutation, finalizarRegistroTrabajoMutation,
  addObservacionMutation, handleOpenProduccionDialog, onError, setIsTeamLocked, navigate,
}: Props) => {
  const [isObservacionDialogOpen, setIsObservacionDialogOpen] = useState(false);
  const [observacionText, setObservacionText] = useState("");
  const prevOperariosLengthRef = useRef(operariosActivosRegistro.length);

  const handleAllOperariosRemoved = () => {
    if (!hasOperacionSeleccionada) return;
    const estadoKind = getEstadoKind(operacionEstado);
    // Solo navegar si el estado indica fin de proceso
    // No setear isTeamLocked a false para permitir que el usuario pueda seguir añadiendo operarios
    if (estadoKind !== "detenido" && estadoKind !== "finproduccion" && estadoKind !== "pendiente") {
      // Permitir que el usuario siga interactuando en TeamManagementCard
      // sin forzar navegación ni cambiar isTeamLocked
    }
  };

  useEffect(() => {
    const prevLen = prevOperariosLengthRef.current;
    const currentLen = operariosActivosRegistro.length;
    prevOperariosLengthRef.current = currentLen;

    if (!hasOperacionSeleccionada) return;
    if (prevLen > 0 && currentLen === 0) handleAllOperariosRemoved();
  }, [hasOperacionSeleccionada, operariosActivosRegistro.length, operacionEstado, navigate]);

  const handleIniciarRegistro = () => {
    if (!operacionId || equipoCount === 0 || isPausaActiva) return;

    if (!hasRegistroActivo) {
      abrirRegistroTrabajoMutation.mutate(
        { operacionId, payload: { idOperarios: selectedOperarioIds } },
        {
          onSuccess: () => {
            registrarEventoMutation.mutate({ operacionId, payload: { idTipoEvento: 1 } });
          },
          onError: (error) => {
            const msg = error.message ?? '';
            const isConcurrency =
              msg.toLowerCase().includes('ya existe') ||
              msg.toLowerCase().includes('registro de trabajo abierto');
            onError(
              isConcurrency
                ? 'La operación ya ha sido iniciada desde otro terminal o por otro usuario.'
                : msg || 'No se pudo iniciar el registro.',
            );
          },
        }
      );
      return;
    }

    if (nextEventoTipo === null) return;

    if (nextEventoTipo === 5) {
      handleOpenProduccionDialog(true);
      return;
    }
    registrarEventoMutation.mutate({ operacionId, payload: { idTipoEvento: nextEventoTipo } });
  };

  const handleFinalizarRegistro = async () => {
    if (!operacionId || isPausaActiva) return;
    const operarioIds = operariosActivosRegistro.map((s) => s.id);
    try {
      await finalizarRegistroTrabajoMutation.mutateAsync({ operacionId, operarioIds });
      setIsTeamLocked(false);
      navigate("/");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Error al finalizar.");
    }
  };

  const handleOpenObservacionDialog = () => {
    if (!hasOperacionSeleccionada || !hasRegistroActivo) return;
    setObservacionText("");
    setIsObservacionDialogOpen(true);
  };

  const handleConfirmObservacion = () => {
    if (!operacionId) return;
    const observacion = observacionText.trim();
    if (!observacion) return;

    setIsObservacionDialogOpen(false);
    setObservacionText("");

    addObservacionMutation.mutate(
      { operacionId, payload: { observacion }, method: "POST" },
      { onError: (error) => onError(error.message || "Error al enviar observación.") }
    );
  };

  return {
    isObservacionDialogOpen, setIsObservacionDialogOpen,
    observacionText, setObservacionText,
    handleIniciarRegistro, handleFinalizarRegistro,
    handleOpenObservacionDialog, handleConfirmObservacion,
    handleAllOperariosRemoved,
  };
};