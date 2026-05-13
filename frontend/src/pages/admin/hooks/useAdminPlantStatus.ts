import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetArticulosPaged } from "../../../hooks/queries/useArticulosQueries";
import { isArticuloVisible } from "../../../utils/estadoArticulosUtils";

export const useAdminPlantStatus = () => {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [referenciaFiltro, setReferenciaFiltro] = useState("");
  const [descripcionFiltro, setDescripcionFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [selectedOp, setSelectedOp] = useState<{ id: string; tipo: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: paged, isLoading, isError, error, isFetching, refetch } =
    useGetArticulosPaged(page + 1, pageSize, {
      soloPendientes: true,
      estado: estadoFiltro,
      referencia: referenciaFiltro,
      descripcion: descripcionFiltro,
    });

  const articulosEnPlanta = useMemo(() => {
    return (paged?.Items ?? [])
      .filter(isArticuloVisible)
      .sort((a, b) => {
        // Artículos sin fecha finPlan van al final
        if (!a.finPlan) return 1;
        if (!b.finPlan) return -1;

        const ta = Date.parse(a.finPlan as string);
        const tb = Date.parse(b.finPlan as string);
        if (!Number.isFinite(ta)) return 1;
        if (!Number.isFinite(tb)) return -1;

        return ta - tb;
      });
  }, [paged]);

  const handleSelectOperacion = (id: string, tipo: string) => setSelectedOp({ id, tipo });
  const handleCloseDialog = () => setSelectedOp(null);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['articulos'] });
    await queryClient.invalidateQueries({ queryKey: ['operaciones'] });
    await refetch();
  };

  const updateFilter = (setter: (val: string) => void) => (val: string) => {
    setter(val);
    setPage(0);
  };

  return {
    page, setPage, pageSize,
    referenciaFiltro, setReferenciaFiltro: updateFilter(setReferenciaFiltro),
    descripcionFiltro, setDescripcionFiltro: updateFilter(setDescripcionFiltro),
    estadoFiltro, setEstadoFiltro: updateFilter(setEstadoFiltro),
    articulosEnPlanta, totalRecords: paged?.TotalRecords ?? 0,
    isLoading, isError, error, isFetching, refetch: handleRefresh,
    selectedOp, handleSelectOperacion, handleCloseDialog
  };
};