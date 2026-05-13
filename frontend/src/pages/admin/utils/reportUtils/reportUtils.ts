import type { Orden } from "../../../../model/aggregates/Ordenes";
import type { OperacionResumenResponse } from "../../../../model/aggregates/Operaciones";
import { CSS } from "./reportUtils.shared.ts";
import { buildInformePortada } from "./reportUtils.portada.ts";
import { buildInformeObservaciones } from "./reportUtils.observaciones.ts";
import { buildInformeIncidencias } from "./reportUtils.incidencias.ts";
import { buildInformeRechazos } from "./reportUtils.rechazos.ts";

export const buildInformeHtml = (
  orden: Orden,
  resumen: OperacionResumenResponse,
): string => {
  const now = new Date().toLocaleString("es-ES");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Informe — ${orden.idNavision} · ${resumen.tipoOperacion}</title>
  <style>${CSS}</style>
</head>
<body>
  ${buildInformePortada(orden, resumen, now)}
  ${buildInformeObservaciones(resumen, now)}
  ${buildInformeIncidencias(resumen, now)}
  ${buildInformeRechazos(resumen, now)}
  <script>window.onload = () => window.print();</script>
</body>
</html>`;
};
