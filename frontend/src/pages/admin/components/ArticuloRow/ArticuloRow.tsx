import { useState, Fragment } from "react";
import { TableRow, TableCell, IconButton, Collapse, Box, Typography, CircularProgress, Table, TableHead, TableBody, Chip } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useGetOperacionesArticulo } from "../../../../hooks/queries/useOperacionesQueries";
import { getEstadoKind, getEstadoLabel } from "../../../../utils/estadoArticulosUtils";
import { getEstadoColor, getProgresoLabel } from "../../utils/adminPlantStatusUtils";
import { type ArticuloResponse } from "../../../../model/aggregates/Articulos";

export const ArticuloRow = ({ articulo, onSelectOperacion }: { articulo: ArticuloResponse, onSelectOperacion: (id: string, tipo: string) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const { data: operaciones = [], isLoading: isLoadingOps } = useGetOperacionesArticulo(expanded ? articulo.id : '');
  const estadoKind = getEstadoKind(articulo.estado);

  return (
    <Fragment>
      <TableRow hover onClick={() => setExpanded(!expanded)} sx={{ cursor: "pointer", "& > *": { borderBottom: "unset" } }}>
        <TableCell><IconButton size="small">{expanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}</IconButton></TableCell>
        <TableCell sx={{ fontWeight: 'bold' }}>{articulo.referencia}</TableCell>
        <TableCell>{articulo.descripcion || "-"}</TableCell>
        <TableCell align="center">{articulo.linea}</TableCell>
        <TableCell align="center">{articulo.cantidad}</TableCell>
        <TableCell>
          <Chip size="small" label={getEstadoLabel(estadoKind, articulo.estado)} color={getEstadoColor(estadoKind)} variant="outlined" />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, bgcolor: 'rgba(0,0,0,0.02)', p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>Operaciones del artículo</Typography>
              {isLoadingOps ? <CircularProgress size={20} /> : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo</TableCell><TableCell>Estado</TableCell><TableCell align="right">Progreso</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {operaciones.map((op) => (
                      <TableRow key={op.id} hover onClick={(e) => { e.stopPropagation(); onSelectOperacion(op.id, op.tipoOperacion); }} sx={{ cursor: 'pointer' }}>
                        <TableCell>{op.tipoOperacion}</TableCell>
                        <TableCell><Chip size="small" label={getEstadoLabel(getEstadoKind(op.estado), op.estado, 'operacion')} color={getEstadoColor(getEstadoKind(op.estado))} /></TableCell>
                        <TableCell align="right">{getProgresoLabel(op)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};