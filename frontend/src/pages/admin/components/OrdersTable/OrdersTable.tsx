import {
  Box,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import type { Orden } from "../../../../model/aggregates/Ordenes";
import { formatOrdenEstado, getOrdenEstadoColor, ADMIN_ORDERS_PAGE_SIZE } from "../../utils/adminOrdersUtils";


type OrdersTableProps = {
  ordenes: Orden[];
  totalRecords: number;
  page: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  onPageChange: (nextPage: number) => void;
  onRowClick: (orden: Orden) => void;
};

export const OrdersTable = ({
  ordenes,
  totalRecords,
  page,
  isLoading,
  isError,
  error,
  isFetching,
  onPageChange,
  onRowClick,
}: OrdersTableProps) => {
  return (
    <Paper sx={{ overflow: "hidden" }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Id Navision</strong>
              </TableCell>
              <TableCell>
                <strong>Cliente</strong>
              </TableCell>
              <TableCell>
                <strong>Descripcion</strong>
              </TableCell>
              <TableCell>
                <strong>Estado</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Box
                    sx={{
                      py: 6,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography color="error">
                    {error?.message || "No se pudieron cargar las ordenes."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : ordenes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography color="text.secondary">
                    No hay ordenes para los filtros actuales.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              ordenes.map((orden) => (
                <TableRow
                  key={orden.id}
                  hover
                  onClick={() => onRowClick(orden)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{orden.idNavision}</TableCell>
                  <TableCell>{orden.cliente?.trim() || "-"}</TableCell>
                  <TableCell>{orden.descripcion}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={formatOrdenEstado(orden.estado)}
                      color={getOrdenEstadoColor(orden.estado)}
                      variant="filled"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalRecords}
        page={page}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        rowsPerPage={ADMIN_ORDERS_PAGE_SIZE}
        rowsPerPageOptions={[ADMIN_ORDERS_PAGE_SIZE]}
        labelRowsPerPage="Filas por pagina"
      />

      {isFetching && !isLoading && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Actualizando resultados...
          </Typography>
        </Box>
      )}
    </Paper>
  );
};