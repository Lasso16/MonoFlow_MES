import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAdminOrders } from "./hooks/useAdminOrders";
import { SectionErrorBoundary } from "../../components/errors/SectionErrorBoundary";
import { OrdersFilterPanel } from "./components/OrdersFilterPanel/OrdersFilterPanel";
import { OrdersTable } from "./components/OrdersTable/OrdersTable";

export const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const {
    page,
    filters,
    ordenes,
    totalRecords,
    isLoading,
    isError,
    isFetching,
    error,
    toggleEstado,
    handleIdNavisionInputChange,
    handleClienteInputChange,
    handleResetFilters,
    handlePageChange,
  } = useAdminOrders();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 1 }}>
        <Typography variant="h4" component="h1">Órdenes</Typography>
        <Button variant="contained" onClick={() => navigate("/admin/crear-orden")}>+ Nueva orden</Button>
      </Box>
      <OrdersFilterPanel filters={filters} onToggleEstado={toggleEstado} onIdNavisionInputChange={handleIdNavisionInputChange} onClienteInputChange={handleClienteInputChange} onResetFilters={handleResetFilters} />
      <SectionErrorBoundary sectionName="Tabla de Órdenes">
        <OrdersTable ordenes={ordenes} totalRecords={totalRecords} page={page} isLoading={isLoading} isError={isError} error={error} isFetching={isFetching} onPageChange={handlePageChange} onRowClick={(orden) => navigate(`/admin/ordenes/${orden.id}`)} />
      </SectionErrorBoundary>
    </Container>
  );
};
