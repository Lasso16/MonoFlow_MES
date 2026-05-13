import type { Orden } from "../../../../model/aggregates/Ordenes";
import type { OperacionResumenResponse } from "../../../../model/aggregates/Operaciones";
import { fmt, fmtDate } from "./reportUtils.shared.ts";

export const buildInformePortada = (orden: Orden, r: OperacionResumenResponse, now: string): string => {
  const totalProducidoOk = r.detalleRegistros.reduce(
    (sum, reg) => sum + reg.producciones.reduce((s, p) => s + p.cantidadOk, 0),
    0,
  );

  return `
  <div class="page">
    <div class="page-header">
      <h1>Informe de Producción</h1>
      <div class="subtitle">
        Orden: <strong>${orden.idNavision}</strong>
        &nbsp;·&nbsp; Operación: <strong>${r.tipoOperacion}</strong>
        &nbsp;·&nbsp; Generado: ${now}
      </div>
    </div>

    <div class="section-title">Información de la Orden</div>
    <div class="card-grid card-grid-3">
      <div class="card">
        <div class="card-label">ID Navision</div>
        <div class="card-value">${orden.idNavision}</div>
      </div>
      <div class="card">
        <div class="card-label">Cliente</div>
        <div class="card-value small">${r.cliente || orden.cliente || "—"}</div>
      </div>
      <div class="card">
        <div class="card-label">Descripción</div>
        <div class="card-value small">${orden.descripcion}</div>
      </div>
    </div>

    <div class="section-title">Información del Artículo y Operación</div>
    <div class="card-grid card-grid-3 card-grid-articulo-operacion">
      <div class="card">
        <div class="card-label">Artículo</div>
        <div class="card-value small">${r.descripcionArticulo || "—"}</div>
      </div>
      <div class="card">
        <div class="card-label">Tipo de operación</div>
        <div class="card-value small">${r.tipoOperacion}</div>
      </div>
      <div class="card">
        <div class="card-label">Período</div>
        <div class="card-value small">${fmtDate(r.inicio)} → ${fmtDate(r.fin)}</div>
      </div>
    </div>

    <div class="section-title">Producción</div>
    <div class="card-grid card-grid-3">
      <div class="card">
        <div class="card-label">Cantidad total planificada</div>
        <div class="card-value">${r.cantidadTotal}</div>
      </div>
      <div class="card">
        <div class="card-label">Unidades fabricadas (OK)</div>
        <div class="card-value td-accent">${totalProducidoOk}</div>
      </div>
      <div class="card">
        <div class="card-label">Registros de trabajo</div>
        <div class="card-value">${r.detalleRegistros.length}</div>
      </div>
    </div>

    <div class="section-title">Tabla de Tiempos</div>
    <table>
      <thead>
        <tr>
          <th>Concepto</th>
          <th style="text-align:right">Tiempo real</th>
          <th style="text-align:right">Tiempo planificado</th>
          <th style="text-align:right">Diferencia</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Tiempo total</strong></td>
          <td class="td-num td-accent">${fmt(r.tiempoTotal)}</td>
          <td class="td-num">${r.tiempoPlanificado != null ? fmt(r.tiempoPlanificado) : "—"}</td>
          <td class="td-num">${r.tiempoPlanificado != null ? fmt(r.tiempoTotal - r.tiempoPlanificado) : "—"}</td>
        </tr>
        <tr>
          <td>Tiempo de preparación</td>
          <td class="td-num">${fmt(r.tiempoPreparacion)}</td>
          <td class="td-num">—</td>
          <td class="td-num">—</td>
        </tr>
        <tr>
          <td>Tiempo de ejecución (efectivo)</td>
          <td class="td-num">${fmt(r.tiempoEfectivo)}</td>
          <td class="td-num">—</td>
          <td class="td-num">—</td>
        </tr>
        <tr>
          <td>Tiempo de recogida</td>
          <td class="td-num">${fmt(r.tiempoRecogida)}</td>
          <td class="td-num">—</td>
          <td class="td-num">—</td>
        </tr>
        <tr>
          <td>Tiempo de incidencias</td>
          <td class="td-num">${fmt(r.tiempoIncidencia)}</td>
          <td class="td-num">—</td>
          <td class="td-num">—</td>
        </tr>
        <tr>
          <td>Tiempo de pausas</td>
          <td class="td-num">${fmt(r.tiempoPausa)}</td>
          <td class="td-num">—</td>
          <td class="td-num">—</td>
        </tr>
      </tbody>
    </table>

  </div>`;
};