import { Container, Box, Typography, Button, CircularProgress, Paper, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, TablePagination } from "@mui/material";
import { useAdminPlantStatus } from "./hooks/useAdminPlantStatus";
import { ArticuloRow } from "./components/ArticuloRow/ArticuloRow";
import { AdminOperacionDialog } from "./components/AdminOperacionDialog/AdminOperacionDialog";
import { PlantStatusFilters } from "./components/PlantStatusFilters/PlantStatusfilters";

export const AdminPlantStatusPage = () => {
  const {
    page, setPage, pageSize, referenciaFiltro, setReferenciaFiltro,
    descripcionFiltro, setDescripcionFiltro, estadoFiltro, setEstadoFiltro,
    articulosEnPlanta, totalRecords, isLoading, isFetching, refetch,
    selectedOp, handleSelectOperacion, handleCloseDialog
  } = useAdminPlantStatus();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Estado de Planta</Typography>
          <Typography variant="body2" color="text.secondary">Seguimiento de artículos y operaciones</Typography>
        </Box>
        <Button variant="contained" onClick={() => void refetch()} disabled={isFetching} startIcon={isFetching && <CircularProgress size={20} color="inherit" />}>
          {isFetching ? "Actualizando..." : "Actualizar"}
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <PlantStatusFilters 
          referencia={referenciaFiltro} setReferencia={setReferenciaFiltro}
          descripcion={descripcionFiltro} setDescripcion={setDescripcionFiltro}
          estado={estadoFiltro} setEstado={setEstadoFiltro}
        />
        
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ width: 56 }} /><TableCell>Referencia</TableCell><TableCell>Descripción</TableCell>
                <TableCell align="center">Línea</TableCell><TableCell align="center">Cantidad</TableCell><TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
              ) : articulosEnPlanta.map(art => (
                <ArticuloRow key={art.id} articulo={art} onSelectOperacion={handleSelectOperacion} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div" count={totalRecords} page={page} rowsPerPage={pageSize}
          onPageChange={(_, newPage) => setPage(newPage)} rowsPerPageOptions={[pageSize]}
        />
      </Paper>

      {selectedOp && (
        <AdminOperacionDialog operacionId={selectedOp.id} operacionTipo={selectedOp.tipo} onClose={handleCloseDialog} />
      )}
    </Container>
  );
};