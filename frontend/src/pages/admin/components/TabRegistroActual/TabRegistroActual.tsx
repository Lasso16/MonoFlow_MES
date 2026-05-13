import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import type { UseAdminOperacionDataResult } from "../../hooks/useAdminOperacionData";
import { formatDateTime } from "../../utils/adminOperacionUtils";
import { useRegistroTrabajoMutations } from "../../../../hooks/queries/useRegistroTrabajoQueries";


type Props = Pick<UseAdminOperacionDataResult, "registroActual" | "sesionesActivas" | "isRegistroActualLoading" | "isRegistroActualFetching" | "incidenciasParosRegistroActual" | "rechazosRegistroActual">;

export const TabRegistroActual = ({
  registroActual,
  sesionesActivas,
  isRegistroActualLoading,
  isRegistroActualFetching,
  incidenciasParosRegistroActual,
  rechazosRegistroActual,
}: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { finalizarRegistroTrabajoMutation } = useRegistroTrabajoMutations();

  const handleConfirm = () => {
    if (!registroActual) return;
    finalizarRegistroTrabajoMutation.mutate(
      { operacionId: registroActual.idOperacion },
      { onSuccess: () => setIsDialogOpen(false) },
    );
  };

  if (isRegistroActualLoading || (isRegistroActualFetching && !registroActual)) {
    return (
      <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!registroActual) {
    return <Typography color="text.secondary">No hay registro abierto actualmente.</Typography>;
  }

  return (
    <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Registro de Trabajo en Curso</Typography>
        <Button
          variant="contained"
          color="error"
          size="small"
          startIcon={<StopCircleIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Finalizar Registro
        </Button>
      </Box>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Finalizar registro de trabajo manual?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta accion detendra el registro actual, cerrara las sesiones activas de los operarios y dejara la operacion disponible para un nuevo registro.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            disabled={finalizarRegistroTrabajoMutation.isPending}
            onClick={handleConfirm}
          >
            {finalizarRegistroTrabajoMutation.isPending ? "Finalizando..." : "Si, finalizar ahora"}
          </Button>
        </DialogActions>
      </Dialog>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: 220 }}>Abierto desde</TableCell>
              <TableCell>{formatDateTime(registroActual.inicio)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Producido</TableCell>
              <TableCell>{registroActual.totalProducidoOk}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Rechazado</TableCell>
              <TableCell>{registroActual.totalRechazado}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="subtitle2" sx={{ mt: 1 }}>Equipo Activo</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              <TableCell>Número</TableCell>
              <TableCell>Nombre</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sesionesActivas.map((sesion) => (
              <TableRow key={sesion.id}>
                <TableCell>{sesion.numeroOperario}</TableCell>
                <TableCell>{sesion.nombre}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Paper variant="outlined" sx={{ p: 1.5, borderLeft: "4px solid", borderLeftColor: "warning.main" }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: "block" }} gutterBottom>
          Incidencias
        </Typography>
        {incidenciasParosRegistroActual.length === 0 ? (
          <Typography variant="caption" color="text.secondary">Sin incidencias registradas en el registro actual.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell>Tipo</TableCell>
                <TableCell>Inicio</TableCell>
                <TableCell>Fin</TableCell>
                <TableCell>Comentario</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidenciasParosRegistroActual.map((inc, i) => (
                <TableRow key={i}>
                  <TableCell sx={{ fontWeight: 600 }}>{inc.tipo}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{inc.inicio !== "-" ? formatDateTime(inc.inicio) : "-"}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{inc.fin !== "-" ? formatDateTime(inc.fin) : "-"}</TableCell>
                  <TableCell>{inc.comentario}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 1.5, borderLeft: "4px solid", borderLeftColor: "error.main" }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: "block" }} gutterBottom>
          Registro de Rechazos
        </Typography>
        {rechazosRegistroActual.length === 0 ? (
          <Typography variant="caption" color="text.secondary">Sin rechazos registrados en el registro actual.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell>Tipo</TableCell>
                <TableCell align="center">Cantidad</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Comentario</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rechazosRegistroActual.map((rech, i) => (
                <TableRow key={i}>
                  <TableCell sx={{ fontWeight: 600 }}>{(rech as any).tipo ? String((rech as any).tipo) : "-"}</TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="error.main" sx={{ fontWeight: "bold" }}>
                      {(rech as any).cantidad ?? (rech as any).Cantidad ?? ""}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary" }}>
                    {formatDateTime((rech as any).timestamp ?? (rech as any).Timestamp ?? (rech as any).inicio ?? (rech as any).Inicio)}
                  </TableCell>
                  <TableCell>{(rech as any).comentario ?? (rech as any).Comentario ?? ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

export default TabRegistroActual;
