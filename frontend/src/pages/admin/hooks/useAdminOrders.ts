import { useMemo, useState } from "react";
import { useGetOrdenes } from "../../../hooks/queries/useOrdenesQueries";
import { ADMIN_ORDERS_PAGE_SIZE } from "../utils/adminOrdersUtils";
import { getEstadoKind } from "../../../utils/estadoArticulosUtils";

const DEFAULT_ESTADOS: string[] = [];

type AdminOrdersFilters = {
  estados: string[];
  idNavision: string;
  cliente: string;
};

const DEFAULT_FILTERS: AdminOrdersFilters = {
  estados: [...DEFAULT_ESTADOS],
  idNavision: "",
  cliente: "",
};

export const useAdminOrders = () => {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<AdminOrdersFilters>(DEFAULT_FILTERS);

  const { data, isLoading, isError, isFetching, error } = useGetOrdenes(
    page + 1,
    ADMIN_ORDERS_PAGE_SIZE,
    {
      idNavision: filters.idNavision,
      cliente: filters.cliente,
    },
    true,
  );

  const ordenesFiltradas = useMemo(() => {
    const items = data?.Items ?? [];

    if (filters.estados.length === 0) {
      return items;
    }

    const selectedEstadoKinds = new Set(
      filters.estados.map((estado) => getEstadoKind(estado)),
    );

    return items.filter((orden) => {
      const ordenEstadoKind = getEstadoKind(orden.estado);
      return selectedEstadoKinds.has(ordenEstadoKind);
    });
  }, [data?.Items, filters.estados]);

  const toggleEstado = (estado: string) => {
    setFilters((current) => ({
      ...current,
      estados: current.estados.includes(estado)
        ? current.estados.filter((item) => item !== estado)
        : [...current.estados, estado],
    }));
    setPage(0);
  };

  const handleIdNavisionInputChange = (value: string) => {
    setFilters((current) => ({
      ...current,
      idNavision: value,
    }));
    setPage(0);
  };

  const handleClienteInputChange = (value: string) => {
    setFilters((current) => ({
      ...current,
      cliente: value,
    }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(0);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  return {
    page,
    pageSize: ADMIN_ORDERS_PAGE_SIZE,
    filters,
    ordenes: ordenesFiltradas,
    totalRecords:
      filters.estados.length === 0
        ? data?.TotalRecords ?? 0
        : ordenesFiltradas.length,
    isLoading,
    isError,
    isFetching,
    error: error ?? null,
    toggleEstado,
    handleIdNavisionInputChange,
    handleClienteInputChange,
    handleResetFilters,
    handlePageChange,
  };
};