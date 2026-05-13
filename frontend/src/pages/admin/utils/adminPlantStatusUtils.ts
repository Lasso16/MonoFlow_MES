import { type EstadoKind } from "../../../utils/estadoArticulosUtils";
import { type OperacionResponse } from "../../../model/aggregates/Operaciones";

export const getEstadoColor = (
  estadoKind: EstadoKind,
): "warning" | "info" | "success" | "error" | "default" => {
  if (estadoKind === 'pendiente') return "warning";
  if (estadoKind === 'enejecucion' || estadoKind === 'enrecogida' || estadoKind === 'enpreparacion') return "info";
  if (estadoKind === 'finproduccion') return "success";
  if (estadoKind === 'incidentado') return "error";
  if (estadoKind === 'pausado' || estadoKind === 'detenido') return "warning";
  return "default";
};

export const formatDateTime = (value?: string): string => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
};

export const getProgresoLabel = (operacion: OperacionResponse): string => {
  const total = operacion.cantidadTotal || 0;
  const cantidadProducida = operacion.cantidadProducida || 0;
  const cantidadRechazada = operacion.cantidadRechazada || 0;
  const completado = cantidadProducida + cantidadRechazada;
  const porcentajeCalculado = total > 0 ? Math.round((completado / total) * 100) : 0;
  const porcentaje = Number.isFinite(operacion.progreso) ? operacion.progreso : porcentajeCalculado;

  return `${porcentaje.toFixed(2)}% (${completado}/${total})`;
};