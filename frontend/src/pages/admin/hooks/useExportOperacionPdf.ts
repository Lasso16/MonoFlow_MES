import { useState } from "react";
// @ts-ignore
import html2pdf from "html2pdf.js";
import { GET_operacionResumen } from "../../../api";
import { buildInformeHtml } from "../utils/reportUtils/reportUtils";
import type { Orden } from "../../../model/aggregates/Ordenes";
import type { OperacionResponse } from "../../../model/aggregates/Operaciones";

export const useExportOperacionPdf = (orden: Orden | null | undefined) => {
  const [exportingId, setExportingId] = useState<string | null>(null);

  const exportOperacion = async (operacion: OperacionResponse) => {
    if (!orden) return;
    setExportingId(operacion.id);
    try {
      const res = await GET_operacionResumen(operacion.id);
      const resData = (res.value as any)?.value ?? res.value;
      const htmlString = buildInformeHtml(orden, resData);
      const element = document.createElement("div");
      element.innerHTML = htmlString;
      element.style.width = "210mm";
      element.style.margin = "0";
      element.style.padding = "0";
      element.style.backgroundColor = "#ffffff";
      const opt = {
        margin: [0, 0, 0, 0] as [number, number, number, number],
        filename: `${orden.cliente}_${orden.idNavision}_${operacion.tipoOperacion.replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg" as const, quality: 1 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
        pagebreak: { mode: ["css", "legacy"] as const },
      };
      await html2pdf().set(opt).from(element).save();
    } finally {
      setExportingId(null);
    }
  };

  return { exportOperacion, exportingId };
};
