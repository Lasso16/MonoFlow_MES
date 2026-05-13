import {
  Container,
  Paper,
  Typography,
  Divider,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";
import { useAdminReports } from "./hooks/useAdminReports";
import { ReportSearchSection } from "./components/ReportSearchSection/ReportSearchSection";
import { ReportListSelector } from "./components/ReportListSelector/ReportListSelector";

export const AdminReportsPage = () => {
  const {
    searchTerm,
    setSearchTerm,
    handleSearch,
    ordenes,
    loadingOrders,
    selectedOrden,
    handleSelectOrden,
    operaciones,
    loadingOps,
    selectedOperacion,
    setSelectedOperacion,
    handleExport,
    isExporting,
    error,
  } = useAdminReports();

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={1} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Generar informes
        </Typography>

        <ReportSearchSection
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={handleSearch}
          loading={loadingOrders}
        />

        <ReportListSelector
          items={ordenes}
          selectedId={selectedOrden?.id}
          onSelect={handleSelectOrden}
          title="Selecciona una Orden"
        />

        {selectedOrden && (
          <>
            <Divider sx={{ my: 3 }} />
            <ReportListSelector
              items={operaciones}
              loading={loadingOps}
              selectedId={selectedOperacion?.id}
              onSelect={setSelectedOperacion}
              title="Selecciona la Operación"
              isOperation
            />
          </>
        )}

        {error && (
          <Typography color="error" align="center" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Stack direction="row" sx={{ justifyContent: "center", mt: 4 }}>
          <Button
            variant="contained"
            color="success"
            onClick={handleExport}
            disabled={!selectedOperacion || isExporting}
            startIcon={
              isExporting ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {isExporting ? "Exportando..." : "Exportar informe PDF"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};
