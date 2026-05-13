import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTiposRechazoNormalizados } from "./useTiposRechazoNormalizados";
import { useGetArticuloById } from "../../../hooks/queries/useArticulosQueries";
import { useGetTiposIncidencia, useGetTiposRechazo } from "../../../hooks/queries/useMaestrosQueries";
import { useGetOperacionById, useGetOperacionProgreso } from "../../../hooks/queries/useOperacionesQueries";
import { useGetOrdenById } from "../../../hooks/queries/useOrdenesQueries";
import { useGetRegistroActualOperacion } from "../../../hooks/queries/useRegistroTrabajoQueries";

export const useTerminalData = (id?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (id) return;
    queryClient.invalidateQueries({ queryKey: ["articulos"] });
    queryClient.invalidateQueries({ queryKey: ["operaciones-articulo"] });
  }, [id, queryClient]);

  const { data: operacion, isError: isErrorOperacion, error: operacionError } = useGetOperacionById(id ?? "");
  const { data: progreso, isError: isErrorProgreso, error: progresoError } = useGetOperacionProgreso(id ?? "");
  const { data: tiposIncidencia = [], isLoading: isLoadingTiposIncidencia } = useGetTiposIncidencia();
  const { data: tiposRechazo = [], isLoading: isLoadingTiposRechazo } = useGetTiposRechazo();
  const tiposRechazoNormalizados = useTiposRechazoNormalizados(tiposRechazo);

  const {
    data: registroActualOperacion,
    isLoading: isLoadingRegistroActualOperacion,
    isError: isErrorRegistroActualOperacion,
  } = useGetRegistroActualOperacion(id ?? "");

  const articuloExt = useGetArticuloById(operacion?.idArticulo ?? "").data as any;
  const { data: orden } = useGetOrdenById(articuloExt?.idOrden ?? "");

  const operacionLoadErrorMessage = (Boolean(id) && (isErrorOperacion || isErrorProgreso))
    ? operacionError?.message || progresoError?.message || "Error al cargar la operación."
    : null;

  return {
    operacion,
    progreso,
    tiposIncidencia,
    tiposRechazoNormalizados,
    registroActualOperacion,
    articulo: articuloExt,
    orden,
    isLoadingTiposIncidencia,
    isLoadingTiposRechazo,
    isLoadingRegistroActualOperacion,
    isErrorRegistroActualOperacion,
    operacionLoadErrorMessage,
  };
};