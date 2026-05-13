import type { OperacionResumenResponse } from "../../../../model/aggregates/Operaciones";
import { fmtDate, operariosEnMomento } from "./reportUtils.shared.ts";

export const buildInformeRechazos = (r: OperacionResumenResponse, now: string): string => {
  void now;

  type RechazoFila = {
    tipo: string;
    cantidad: number;
    comentario: string;
    timestamp: string;
    operarios: string;
  };

  const filas: RechazoFila[] = [];
  for (const reg of r.detalleRegistros) {
    for (const rc of reg.rechazos) {
      filas.push({
        ...rc,
        operarios: operariosEnMomento(reg, rc.timestamp),
      });
    }
  }

  const totalUnidades = filas.reduce((s, f) => s + f.cantidad, 0);

  const rows =
    filas.length > 0
      ? filas
          .map(
            (rc, i) => `
          <tr>
            <td>${i + 1}</td>
            <td style="white-space:nowrap">${fmtDate(rc.timestamp)}</td>
            <td><strong>${rc.tipo}</strong></td>
            <td class="td-num td-accent">${rc.cantidad}</td>
            <td>${rc.comentario || "<span class='td-muted'>—</span>"}</td>
            <td>${rc.operarios}</td>
          </tr>`,
          )
          .join("")
      : `<tr><td colspan="6" class="td-muted" style="text-align:center;padding:14px">
           Sin rechazos registrados en esta operación
         </td></tr>`;

  return `
  <div class="page">
    <div class="page-header">
      <h1>Rechazos</h1>
      <div class="subtitle">
        Operación: <strong>${r.tipoOperacion}</strong>
        &nbsp;·&nbsp; Artículo: <strong>${r.descripcionArticulo}</strong>
        &nbsp;·&nbsp; Total rechazos: <strong>${filas.length}</strong>
        &nbsp;·&nbsp; Total unidades rechazadas: <strong>${totalUnidades}</strong>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:30px">#</th>
          <th>Fecha</th>
          <th>Tipo</th>
          <th style="text-align:right">Cantidad</th>
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