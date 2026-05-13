import type { OperacionResumenResponse } from "../../../../model/aggregates/Operaciones";
import { fmt, fmtDate, operariosEnMomento } from "./reportUtils.shared.ts";

export const buildInformeIncidencias = (r: OperacionResumenResponse, now: string): string => {
  void now;

  type IncidenciaFila = {
    tipoIncidencia: string;
    comentario: string;
    inicio: string;
    fin?: string;
    duracionMinutos: number;
    operarios: string;
  };

  const filas: IncidenciaFila[] = [];
  for (const reg of r.detalleRegistros) {
    for (const inc of reg.incidencias) {
      const operariosStr = operariosEnMomento(reg, inc.inicio);
      filas.push({ ...inc, operarios: operariosStr });
    }
  }

  const rows =
    filas.length > 0
      ? filas
          .map(
            (inc, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${fmtDate(inc.inicio)}</td>
            <td>${fmtDate(inc.fin)}</td>
            <td class="td-num">${fmt(inc.duracionMinutos)}</td>
            <td><strong>${inc.tipoIncidencia}</strong></td>
            <td>${inc.comentario || "<span class='td-muted'>—</span>"}</td>
            <td>${inc.operarios}</td>
          </tr>`,
          )
          .join("")
      : `<tr><td colspan="7" class="td-muted" style="text-align:center;padding:14px">
           Sin incidencias registradas en esta operación
         </td></tr>`;

  return `
  <div class="page">
    <div class="page-header">
      <h1>Incidencias</h1>
      <div class="subtitle">
        Operación: <strong>${r.tipoOperacion}</strong>
        &nbsp;·&nbsp; Artículo: <strong>${r.descripcionArticulo}</strong>
        &nbsp;·&nbsp; Total incidencias: <strong>${filas.length}</strong>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:30px">#</th>
          <th>Inicio</th>
          <th>Fin</th>
          <th style="text-align:right">Duración</th>
          <th>Motivo</th>
          <th>Comentario</th>
          <th>Operarios presentes</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

  </div>`;
};