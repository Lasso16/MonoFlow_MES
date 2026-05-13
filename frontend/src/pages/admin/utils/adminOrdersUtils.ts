import { formatEstado, getEstadoColor } from "../../../utils/estadoArticulosUtils";

export const ADMIN_ORDERS_PAGE_SIZE = 20;

export const formatOrdenEstado = (estado?: string): string => formatEstado(String(estado ?? ""));

export const getOrdenEstadoColor = (
  estado?: string | number | null,
): "warning" | "info" | "success" | "default" => getEstadoColor(estado);
