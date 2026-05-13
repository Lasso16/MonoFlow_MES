import type { OperacionResumenResponse } from "../../../../model/aggregates/Operaciones";
import { fmtDate, operariosDeRegistro } from "./reportUtils.shared.ts";

export const buildInformeObservaciones = (r: OperacionResumenResponse, _now: string): string => {
  const registrosConObs = r.detalleRegistros.filter(
    (reg) => reg.observaciones && reg.observaciones.trim() !== "",
  );

  const rows =
    registrosConObs.length > 0
      ? registrosConObs
          .map((reg, i) => {
            const lineas = reg.observaciones!
              .split(/\r?\n/)
              .map((l) => l.trim())
              .filter((l) => l.length > 0);

            const obsHtml =
              lineas.length > 0
                ? `<ul style="margin:0;padding-left:16px">${lineas.map((l) => `<li>${l}</li>`).join("")}</ul>`
                : `<span class="td-muted">—</span>`;

            return `
          <tr>
            <td style="white-space:nowrap;vertical-align:top">${i + 1}</td>
            <td style="white-space:nowrap;vertical-align:top">${fmtDate(reg.inicio)}</td>
            <td style="white-space:nowrap;vertical-align:top">${fmtDate(reg.fin)}</td>
            <td class="td-observaciones" style="vertical-align:top">${obsHtml}</td>
            <td style="vertical-align:top">${operariosDeRegistro(reg)}</td>
          </tr>`;
          })
          .join("")
      : `<tr><td colspan="5" class="td-muted" style="text-align:center;padding:14px">
           Sin observaciones registradas en esta operación
         </td></tr>`;

  const totalObs = registrosConObs.reduce((sum, reg) => {
    return sum + (reg.observaciones?.split(/\r?\n/).filter((l) => l.trim()).length ?? 0);
  }, 0);

  return `
  <div class="page">
    <div class="page-header">
      <h1>Observaciones por Registro</h1>
      <div class="subtitle">
        Operación: <strong>${r.tipoOperacion}</strong>
        &nbsp;·&nbsp; Artículo: <strong>${r.descripcionArticulo}</strong>
        &nbsp;·&nbsp; Registros con observaciones: <strong>${registrosConObs.length}</strong>
        &nbsp;·&nbsp; Total observaciones: <strong>${totalObs}</strong>
      </div>
    </div>

    <table class="table-observaciones">
      <thead>
        <tr>
          <th style="width:30px">#</th>
          <th style="width:110px">Inicio registro</th>
          <th style="width:110px">Fin registro</th>
          <th style="width:40%">Observaciones</th>
          <th style="width:30%">Operarios del registro</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

  </div>`;
};