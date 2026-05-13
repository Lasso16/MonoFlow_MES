import { useState } from "react";
import type { UseMutationResult } from "@tanstack/react-query";

type Props = {
  operacionId?: string;
  nextEventoTipo: number | null;
  registrarProduccionMutation: UseMutationResult<any, Error, any>;
  registrarRechazoMutation: UseMutationResult<any, Error, any>;
  registrarEventoMutation: UseMutationResult<any, Error, any>;
  onError: (msg: string) => void;
};

export const useTerminalProduccionFlow = ({
  operacionId,
  nextEventoTipo,
  registrarProduccionMutation,
  registrarRechazoMutation,
  registrarEventoMutation,
  onError,
}: Props) => {
  const [isProduccionDialogOpen, setIsProduccionDialogOpen] = useState(false);
  const [piezasBuenasText, setPiezasBuenasText] = useState("");
  const [piezasRechazadasText, setPiezasRechazadasText] = useState("");
  const [selectedRechazoId, setSelectedRechazoId] = useState("");
  const [rechazoComentario, setRechazoComentario] = useState("");
  const [isAvancePendiente, setIsAvancePendiente] = useState(false);

  const handleOpenProduccionDialog = (forAvance = false) => {
    setIsAvancePendiente(forAvance);
    setPiezasBuenasText("");
    setPiezasRechazadasText("");
    setSelectedRechazoId("");
    setRechazoComentario("");
    setIsProduccionDialogOpen(true);
  };

  const resetProduccionDialogState = () => {
    setIsProduccionDialogOpen(false);
    setPiezasBuenasText("");
    setPiezasRechazadasText("");
    setSelectedRechazoId("");
    setRechazoComentario("");
    setIsAvancePendiente(false);
  };

  const handleConfirmProduccion = () => {
    if (!operacionId) return;

    const piezasBuenas = Number(piezasBuenasText || "0");
    const piezasRechazadas = Number(piezasRechazadasText || "0");
    const hasBuenas = Number.isFinite(piezasBuenas) && piezasBuenas > 0;
    const hasRechazadas = Number.isFinite(piezasRechazadas) && piezasRechazadas > 0;

    const shouldAvanzar = isAvancePendiente && nextEventoTipo !== null;

    resetProduccionDialogState();

    if (hasBuenas) {
      registrarProduccionMutation.mutate(
        { operacionId, payload: { cantidad: piezasBuenas } },
        { onError: (error) => onError(error.message || "Error al registrar piezas buenas.") }
      );
    }

    if (hasRechazadas) {
      registrarRechazoMutation.mutate(
        {
          operacionId,
          payload: {
            cantidad: piezasRechazadas,
            idTipoRechazo: Number(selectedRechazoId),
            comentario: rechazoComentario.trim() || null,
          },
        },
        { onError: (error) => onError(error.message || "Error al registrar rechazo.") }
      );
    }

    if (shouldAvanzar) {
      registrarEventoMutation.mutate(
        { operacionId, payload: { idTipoEvento: nextEventoTipo } },
        { onError: (error) => onError(error.message || "No se pudo cambiar de evento.") }
      );
    }
  };

  return {
    isProduccionDialogOpen, setIsProduccionDialogOpen,
    piezasBuenasText, setPiezasBuenasText,
    piezasRechazadasText, setPiezasRechazadasText,
    selectedRechazoId, setSelectedRechazoId,
    rechazoComentario, setRechazoComentario,
    isAvancePendiente, setIsAvancePendiente,
    handleOpenProduccionDialog, handleConfirmProduccion,
  };
};