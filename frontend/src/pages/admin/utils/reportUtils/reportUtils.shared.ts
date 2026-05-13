import type { DetalleRegistroDTO } from "../../../../model/aggregates/Operaciones";

export const fmt = (min: number): string => {
  if (!min || min <= 0) return "0 min";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
};

export const fmtDate = (iso?: string): string => {
  if (!iso) return "En curso";
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const operariosDeRegistro = (reg: DetalleRegistroDTO): string => {
  if (!reg.operarios || reg.operarios.length === 0) return "—";
  return reg.operarios.map((op) => `${op.nombreOperario}${op.numeroOperario ? ` (${op.numeroOperario})` : ""}`).join(", ");
};

export const operariosEnMomento = (reg: DetalleRegistroDTO, momentoIso: string): string => {
  if (!reg.operarios || reg.operarios.length === 0) return "—";
  const momento = new Date(momentoIso).getTime();
  const presentes = reg.operarios.filter((op) => {
    const ini = new Date(op.inicio).getTime();
    if (ini > momento) return false;
    if (!op.fin) return true;
    return new Date(op.fin).getTime() >= momento;
  });
  if (presentes.length === 0) return "—";
  return presentes.map((op) => `${op.nombreOperario}${op.numeroOperario ? ` (${op.numeroOperario})` : ""}`).join(", ");
};

export const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Arial', sans-serif;
    font-size: 12px;
    color: #1a1a1a;
    background: #fff;
    width: 100%;
  }
  
  .page {
    width: 100%;
    /* reduce padding to avoid large empty areas at page bottom */
    padding: 12mm 12mm 10mm 12mm; /* arriba, derecha, abajo, izquierda */
    page-break-after: always;
    break-after: page;
  }
  
  .page:last-child {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  .page-header {
    border-bottom: 3px solid #1565c0;
    padding-bottom: 14px;
    margin-bottom: 24px;
  }
  
  .page-header h1 {
    font-size: 22px;
    color: #1565c0;
    letter-spacing: -0.3px;
  }
  
  .page-header .subtitle {
    color: #555;
    font-size: 12px;
    margin-top: 4px;
  }
  
  .page-number {
    float: right;
    font-size: 11px;
    color: #999;
    padding-top: 4px;
  }
  
  .card-grid {
    display: grid;
    gap: 12px;
    margin-bottom: 24px;
    align-items: start;
  }
  
  .card-grid-2 { grid-template-columns: 1fr 1fr; }
  .card-grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .card-grid-articulo-operacion { grid-template-columns: 1fr 1fr 1.25fr; }
  
  .card {
    background: #f5f7fa;
    border: 1px solid #dde3ec;
    border-radius: 6px;
    padding: 12px 16px;
    min-width: 0;
  }
  
  .card .card-label {
    font-size: 10px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 4px;
  }
  
  .card .card-value {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a1a;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  
  .card .card-value.small { font-size: 12px; font-weight: 600; }
  
  .section-title {
    font-size: 13px;
    font-weight: 700;
    color: #1565c0;
    border-left: 4px solid #1565c0;
    padding-left: 8px;
    margin-bottom: 10px;
    margin-top: 20px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 8px;
    font-size: 11.5px;
    page-break-inside: auto;
  }
  .table-observaciones {
    table-layout: fixed;
    width: 100%;
  }
  .table-observaciones th,
  .table-observaciones td {
    overflow-wrap: break-word;
    word-break: break-word;
  }
  .td-observaciones {
    width: 40%;
    max-width: 40%;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  
  thead {
    display: table-header-group;
  }
  
  thead tr {
    background: #1565c0;
    color: #fff;
    border-bottom: 3px solid #0f4e9b;
  }
  
  thead th {
    padding: 7px 10px 11px;
    text-align: left;
    font-weight: 600;
    font-size: 11px;
  }
  
  tbody tr:nth-child(even) { background: #f5f7fa; }
  tbody tr:hover { background: #eef2fb; }
  
  tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  
  tbody td {
    padding: 6px 10px;
    border-bottom: 1px solid #e8edf6;
    vertical-align: top;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .td-num { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
  .td-accent { color: #1565c0; font-weight: 700; }
  .td-muted { color: #888; font-style: italic; }
  .td-total { font-weight: 700; background: #e8edf6 !important; }
  
  footer {
    margin-top: 12px;
    padding-top: 6px;
    border-top: 1px solid #dde3ec;
    font-size: 10px;
    color: #aaa;
    text-align: right;
  }
  
`;