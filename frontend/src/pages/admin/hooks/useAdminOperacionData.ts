import { useMemo } from "react";
import { useGetRegistroActualOperacion } from "../../../hooks/queries/useRegistroTrabajoQueries";
import { useGetOperacionResumen } from "../../../hooks/queries/useOperacionesQueries";
import {
  extractSesionesActivas,
  pickArray,
  pickText,
  type SesionActivaAdmin,
} from "../utils/adminOperacionUtils";

export const useAdminOperacionData = (operacionId?: string | null) => {
  const {
    data: registroActual,
    isLoading: isRegistroActualLoading,
    isFetching: isRegistroActualFetching,
  } = useGetRegistroActualOperacion(operacionId ?? undefined);

  const { data: resumenOperacion, isLoading: isResumenLoading } =
    useGetOperacionResumen(operacionId ?? "");

  const sesionesActivas: SesionActivaAdmin[] = useMemo(
    () => extractSesionesActivas(registroActual),
    [registroActual],
  );

  const resumenRoot = useMemo(() => {
    const value = resumenOperacion as any;
    return value?.value && typeof value.value === "object" ? value.value : value;
  }, [resumenOperacion]);

  const historialRegistros = useMemo(() => {
    if (!resumenRoot) return [];
    const lista = pickArray(resumenRoot, [
      "detalleRegistros",
      "DetalleRegistros",
      "registros",
      "Registros",
      "items",
      "Items",
    ]);

    return [...lista].sort((a: unknown, b: unknown) => {
      if (
        typeof a === "object" &&
        a !== null &&
        typeof b === "object" &&
        b !== null
      ) {
        const objA = a as Record<string, unknown>;
        const objB = b as Record<string, unknown>;
        const fechaA = new Date(String(objA.inicio ?? objA.Inicio ?? "")).getTime();
        const fechaB = new Date(String(objB.inicio ?? objB.Inicio ?? "")).getTime();
        return fechaB - fechaA;
      }
      return 0;
    });
  }, [resumenRoot]);

  const rechazosRegistroActual = useMemo(() => {
    if (!registroActual) return [];

    const rechazosRegistro = pickArray(registroActual, ["rechazos", "Rechazos"]);
    if (rechazosRegistro.length > 0) return rechazosRegistro;

    const inicioRegistro = new Date(registroActual.inicio).getTime();
    const finRegistro = registroActual.fin ? new Date(registroActual.fin).getTime() : Date.now();

    const rechazosGlobales = pickArray(resumenRoot, ["rechazos", "Rechazos"]);

    return rechazosGlobales.filter((rech: unknown) => {
      if (typeof rech !== "object" || rech === null) return false;
      const r = rech as Record<string, unknown>;
      const timestamp = r.timestamp ?? r.Timestamp ?? r.inicio ?? r.Inicio;
      const rechTs = new Date(String(timestamp ?? "")).getTime();

      return (!Number.isNaN(rechTs) && rechTs >= inicioRegistro && rechTs <= finRegistro);
    });
  }, [registroActual, resumenRoot]);

  const incidenciasParosRegistroActual = useMemo(() => {
    if (!registroActual) return [];

    const eventos = pickArray(registroActual, ["eventos", "Eventos"]);
    const incidencias = pickArray(registroActual, ["incidencias", "Incidencias"]);

    const incidenciaPorEventoId = incidencias.reduce(
      (acc: Record<string, unknown>, inc: unknown) => {
        const idEvento = pickText(inc, ["idEvento", "IdEvento", "eventoId", "EventoId", "id_evento"], "");
        if (idEvento) acc[idEvento] = inc;
        return acc;
      },
      {},
    );

    const rowsFromEventos = eventos
      .map((evento: unknown) => {
        const idEvento = pickText(evento, ["idEvento", "IdEvento", "id", "Id"], "");
        const tipoEvento = pickText(evento, ["nombreTipoEvento", "NombreTipoEvento", "tipoEvento", "TipoEvento"], "Evento");
        const incidencia = idEvento ? incidenciaPorEventoId[idEvento] : undefined;

        const esParoOIncidencia = tipoEvento.toLowerCase().includes("paro") || tipoEvento.toLowerCase().includes("inciden") || Boolean(incidencia);

        if (!esParoOIncidencia) return null;

        return {
          key: idEvento || `${tipoEvento}-${pickText(evento, ["inicio", "Inicio"], "sin-inicio")}`,
          tipo: pickText(incidencia, [
            "nombreTipoIncidencia",
            "NombreTipoIncidencia",
            "tipoIncidencia",
            "TipoIncidencia",
          ], tipoEvento),
          inicio: pickText(evento, ["inicio", "Inicio"], "-"),
          fin: pickText(evento, ["fin", "Fin"], "-"),
          comentario: pickText(incidencia, ["comentario", "Comentario"], "-"),
        };
      })
      .filter(Boolean) as Array<{ key: string; tipo: string; inicio: string; fin: string; comentario: string }>;

    const usedKeys = new Set(rowsFromEventos.map((row) => row.key));
    const incidenciasSinEvento = incidencias
      .map((inc: unknown, index: number) => {
        const idEvento = pickText(inc, ["idEvento", "IdEvento", "eventoId", "EventoId", "id_evento"], "");
        if (idEvento && usedKeys.has(idEvento)) return null;

        return {
          key: idEvento || `incidencia-${index}`,
          tipo: pickText(inc, [
            "nombreTipoIncidencia",
            "NombreTipoIncidencia",
            "tipoIncidencia",
            "TipoIncidencia",
          ], "Incidencia"),
          inicio: pickText(inc, ["inicio", "Inicio", "timestamp", "Timestamp"], "-"),
          fin: pickText(inc, ["fin", "Fin"], "-"),
          comentario: pickText(inc, ["comentario", "Comentario"], "-"),
        };
      })
      .filter(Boolean) as Array<{ key: string; tipo: string; inicio: string; fin: string; comentario: string }>;

    return [...rowsFromEventos, ...incidenciasSinEvento];
  }, [registroActual, resumenRoot]);

  return {
    registroActual,
    resumenOperacion,
    sesionesActivas,
    resumenRoot,
    historialRegistros,
    rechazosRegistroActual,
    incidenciasParosRegistroActual,
    isRegistroActualLoading,
    isRegistroActualFetching,
    isResumenLoading,
  } as const;
};

export type UseAdminOperacionDataResult = ReturnType<typeof useAdminOperacionData>;
