import { useState } from "react";
// @ts-ignore (por si no tienes los types instalados)
import html2pdf from "html2pdf.js";

import { useGetOrdenes } from "../../../hooks/queries/useOrdenesQueries";
import { GET_articulosOrden, GET_operacionesArticulo, GET_operacionResumen } from "../../../api";
import { buildInformeHtml } from "../utils/reportUtils/reportUtils";
import type { Orden } from "../../../model/aggregates/Ordenes";
import type { OperacionResponse } from "../../../model/aggregates/Operaciones";

export type OperacionItem = OperacionResponse & { articuloDescripcion?: string };

export const useAdminReports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
  const [operaciones, setOperaciones] = useState<OperacionItem[]>([]);
  const [selectedOperacion, setSelectedOperacion] = useState<OperacionItem | null>(null);

  const [loadingOps, setLoadingOps] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading: loadingOrders, isError: ordersError } = useGetOrdenes(
    1, 20, { idNavision: searchQuery }, Boolean(searchQuery)
  );

  const handleSearch = () => {
    setSearchQuery(searchTerm.trim());
    setSelectedOrden(null);
    setOperaciones([]);
    setError(null);
  };

  const handleSelectOrden = async (orden: Orden) => {
    setSelectedOrden(orden);
    setLoadingOps(true);
    setError(null);
    try {
      const artResult = await GET_articulosOrden(orden.id);
      if (artResult.isFailure) throw new Error("Error al cargar artículos");
      
      const articulos = artResult.value ?? [];
      const results = await Promise.all(
        articulos.map((art) => GET_operacionesArticulo(art.id ?? "").then((opResult) => {
          const raw = opResult.value as any;
          const items: any[] = raw?.value?.items ?? raw?.items ?? (Array.isArray(raw) ? raw : []);
          return items.map((op) => ({ ...op, articuloDescripcion: art.referencia }));
        }))
      );
      setOperaciones(results.flat());
    } catch (err) {
      setError("No se pudieron cargar las operaciones.");
    } finally {
      setLoadingOps(false);
    }
  };

  const handleExport = async () => {
    if (!selectedOrden || !selectedOperacion) return;
    
    // 1. Guardamos los datos de la operación actual en una constante local.
    // Esto nos permite hacer la llamada al backend aunque limpiemos el estado.
    const operacionAExportar = selectedOperacion;

    // 2. Activamos el modo exportación y limpiamos la operación seleccionada.
    // Esto inhabilitará el botón inmediatamente.
    setIsExporting(true);
    setSelectedOperacion(null);
    setError(null);

    try {
      // Usamos 'operacionAExportar' en lugar de 'selectedOperacion'
      const res = await GET_operacionResumen(operacionAExportar.id);
      const resData = (res.value as any)?.value ?? res.value;
      
      const htmlString = buildInformeHtml(selectedOrden, resData);

      const element = document.createElement("div");
      element.innerHTML = htmlString;       
    
      element.style.width = "210mm";
      element.style.margin = "0";
      element.style.padding = "0";
      element.style.backgroundColor = "#ffffff";

      const opt = {
        margin: [0, 0, 0, 0] as [number, number, number, number],
        // Usamos 'operacionAExportar' para el nombre del archivo
        filename: `${selectedOrden.cliente}_${selectedOrden.idNavision}_${operacionAExportar.tipoOperacion.replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg" as const, quality: 1 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true 
        },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
        pagebreak: { mode: ["css", "legacy"] as const } 
      };

      await html2pdf().set(opt).from(element).save();

    } catch {
      setError("Error al generar y descargar el PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    searchTerm, setSearchTerm, handleSearch,
    ordenes: data?.items ?? [], loadingOrders, ordersError,
    selectedOrden, handleSelectOrden,
    operaciones, loadingOps, selectedOperacion, setSelectedOperacion,
    handleExport, isExporting, error
  };
};