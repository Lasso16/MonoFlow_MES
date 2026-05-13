import { Accordion, AccordionDetails, AccordionSummary, Box, CircularProgress, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { UseAdminOperacionDataResult } from "../../hooks/useAdminOperacionData";
import { pickArray, formatDateTime, pickNumber } from "../../utils/adminOperacionUtils";
import { OperarioTimeline } from "../OperarioTimeline";

type Props = Pick<UseAdminOperacionDataResult, "historialRegistros" | "resumenRoot" | "isResumenLoading">;

export const TabHistorial = ({ historialRegistros, resumenRoot, isResumenLoading }: Props) => {
  if (isResumenLoading) {
    return (
      <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!historialRegistros || historialRegistros.length === 0) {
    return <Typography color="text.secondary">No hay historial disponible.</Typography>;
  }

  return (
    <Box sx={{ mt: 1 }}>
      {historialRegistros.map((registro: unknown, index: number) => {
        const resumen = resumenRoot;

        const producciones = pickArray(registro, ["producciones", "Producciones"]);
        const totalOkByArray = producciones.reduce((sum: number, p: unknown) => sum + pickNumber(p, ["cantidadOk", "CantidadOk", "cantidad", "Cantidad"]), 0);
        const totalOk = totalOkByArray || pickNumber(registro, ["totalProducidoOk", "TotalProducidoOk"]);

        const regStart = new Date((registro as any).inicio ?? (registro as any).Inicio ?? "").getTime();
        const regEndStr = (registro as any).fin ?? (registro as any).Fin ?? "";
        const regEnd = regEndStr ? new Date(regEndStr).getTime() : Date.now();

        const incidenciasRegistro = pickArray(registro, ["incidencias", "Incidencias"]);
        const incidenciasGlobales = pickArray(resumen, ["incidencias", "Incidencias"]);
        const incidenciasH = incidenciasRegistro.length ? incidenciasRegistro : incidenciasGlobales.filter((inc: unknown) => {
          const incStart = new Date((inc as any).inicio ?? (inc as any).Inicio ?? (inc as any).timestamp ?? (inc as any).Timestamp ?? "").getTime();
          return !Number.isNaN(incStart) && incStart >= regStart && incStart <= regEnd;
        });

        const rechazosRegistro = pickArray(registro, ["rechazos", "Rechazos"]);
        const rechazosGlobales = pickArray(resumen, ["rechazos", "Rechazos"]);
        const rechazosH = rechazosRegistro.length ? rechazosRegistro : rechazosGlobales.filter((rech: unknown) => {
          const rechTs = new Date((rech as any).timestamp ?? (rech as any).Timestamp ?? (rech as any).inicio ?? (rech as any).Inicio ?? "").getTime();
          return !Number.isNaN(rechTs) && rechTs >= regStart && rechTs <= regEnd;
        });

        return (
          <Accordion key={(registro as any).registroId ?? (registro as any).RegistroId ?? (registro as any).id ?? index} sx={{ mb: 1, border: "1px solid", borderColor: "divider" }} elevation={0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", pr: 2, alignItems: "center" }}>
                <Typography sx={{ fontWeight: "bold" }}>{formatDateTime((registro as any).inicio ?? (registro as any).Inicio)} — {regEndStr ? formatDateTime(regEndStr) : "En curso"}</Typography>
                <Box sx={{ display: "flex", gap: 3 }}>
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>Producido: {Number(totalOk)}</Typography>
                  <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>Rechazo: {Number(rechazosH.reduce((sum: number, r: unknown) => sum + pickNumber(r, ["cantidad", "Cantidad"]), 0))}</Typography>
                </Box>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ bgcolor: "white", display: "grid", gap: 2 }}>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="overline" color="text.secondary" sx={{ display: "block" }} gutterBottom>Personal del Turno</Typography>
                <OperarioTimeline registro={registro} />
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.5, borderLeft: "4px solid", borderLeftColor: "warning.main" }}>
                <Typography variant="overline" color="text.secondary" sx={{ display: "block" }} gutterBottom>Incidencias</Typography>
                {incidenciasH.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">Sin incidencias registradas en este turno.</Typography>
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
                      {incidenciasH.map((inc: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontWeight: 600 }}>{inc.nombreTipoIncidencia ?? inc.NombreTipoIncidencia ?? inc.tipoIncidencia ?? inc.TipoIncidencia ?? "Incidencia"}</TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateTime(inc.inicio ?? inc.Inicio ?? inc.timestamp ?? inc.Timestamp)}</TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{inc.fin ?? inc.Fin ? formatDateTime(inc.fin ?? inc.Fin) : "-"}</TableCell>
                          <TableCell>{inc.comentario ?? inc.Comentario ?? "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.5, borderLeft: "4px solid", borderLeftColor: "error.main" }}>
                <Typography variant="overline" color="text.secondary" sx={{ display: "block" }} gutterBottom>Registro de Rechazos</Typography>
                {rechazosH.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">Sin rechazos registrados.</Typography>
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
                      {rechazosH.map((rech: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontWeight: 600 }}>{rech.tipo ?? rech.Tipo}</TableCell>
                          <TableCell align="center"><Typography variant="body2" color="error.main" sx={{ fontWeight: "bold" }}>{rech.cantidad ?? rech.Cantidad}</Typography></TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary" }}>{formatDateTime(rech.timestamp ?? rech.Timestamp ?? rech.inicio ?? rech.Inicio)}</TableCell>
                          <TableCell>{rech.comentario ?? rech.Comentario}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default TabHistorial;
