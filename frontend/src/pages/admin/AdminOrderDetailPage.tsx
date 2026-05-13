import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArticleIcon from "@mui/icons-material/Article";
import DeleteIcon from "@mui/icons-material/Delete";
import { AdminOperacionDialog } from "./components/AdminOperacionDialog/AdminOperacionDialog";
import { AdminCreateOperacionDialog } from "./components/AdminCreateOperacionDialog/AdminCreateOperacionDialog";
import {
  AdminAddArticuloDialog,
  type ArticuloFormValues,
} from "./components/AdminAddArticuloDialog/AdminAddArticuloDialog";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetArticulosOrden } from "../../hooks/queries/useArticulosQueries";
import { useGetTiposOperacion } from "../../hooks/queries/useMaestrosQueries";
import { useGetOperacionesArticulos, useOperacionMutations } from "../../hooks/queries/useOperacionesQueries";
import {
  useGetOrdenById,
  useCreateArticuloOrdenMutation,
  useOrdenesMutations,
} from "../../hooks/queries/useOrdenesQueries";
import { useArticulosMutations } from "../../hooks/queries/useArticulosQueries";
import type { ArticuloOrden } from "../../model/aggregates/Ordenes";
import type { OperacionResponse } from "../../model/aggregates/Operaciones";
import { formatEstado, getEstadoColor } from "../../utils/estadoArticulosUtils";
import { useExportOperacionPdf } from "./hooks/useExportOperacionPdf";



const sortArticulosByLinea = (items: ArticuloOrden[]): ArticuloOrden[] => {
  return [...items].sort((a, b) => a.linea - b.linea);
};

export const AdminOrderDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    data: orden,
    isLoading: isOrdenLoading,
    isError: isOrdenError,
    error: ordenError,
  } = useGetOrdenById(id ?? "");

  const {
    data: articulos = [],
    isLoading: isArticulosLoading,
    isError: isArticulosError,
    error: articulosError,
  } = useGetArticulosOrden(id ?? "");

  // MUTACIÓN PARA CREAR EL ARTÍCULO EN LA API
  const createArticuloMutation = useCreateArticuloOrdenMutation();

  const articulosOrdenados = useMemo(
    () => sortArticulosByLinea(articulos),
    [articulos],
  );
  const idsArticulos = useMemo(
    () =>
      articulosOrdenados.map((articulo) => articulo.id ?? "").filter(Boolean),
    [articulosOrdenados],
  );

  const { operacionesByArticuloId, isLoading: isOperacionesLoading } =
    useGetOperacionesArticulos(idsArticulos);
  const { data: tiposOperacion = [] } = useGetTiposOperacion();

  const tiposOperacionOptions = useMemo(() => {
    const unique = new Map<number, string>();
    tiposOperacion.forEach((tipoOperacion) => {
      const id = Number(tipoOperacion.id);
      if (!Number.isFinite(id)) return;

      const label =
        tipoOperacion.tipo?.trim() ||
        tipoOperacion.nombre?.trim() ||
        tipoOperacion.descripcion?.trim() ||
        `Tipo ${id}`;
      if (!unique.has(id)) {
        unique.set(id, label);
      }
    });

    return Array.from(unique.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.id - b.id);
  }, [tiposOperacion]);

  // Estados de los diálogos de Nueva Operación
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedArticuloId, setSelectedArticuloId] = useState<string>("");
  const [selectedArticuloLabel, setSelectedArticuloLabel] =
    useState<string>("");

  // Estados para visualizar Operación y Registros
  const [selectedOperacionId, setSelectedOperacionId] = useState<string | null>(
    null,
  );
  const [selectedOperacionTipo, setSelectedOperacionTipo] =
    useState<string>("");

  const [isAddArticuloDialogOpen, setIsAddArticuloDialogOpen] = useState(false);

  // --- HANDLERS PARA CREAR OPERACIÓN ---
  const handleOpenCreateDialog = (articulo: ArticuloOrden) => {
    if (!articulo.id) return;
    setSelectedArticuloId(articulo.id);
    setSelectedArticuloLabel(`${articulo.referencia}`);
    setIsCreateDialogOpen(true);
  };

  const handleOpenAddArticuloDialog = () => {
    setIsAddArticuloDialogOpen(true);
  };

  // --- HANDLER PARA GUARDAR EL ARTÍCULO EN LA API ---
  const handleGuardarArticuloEnAPI = (data: ArticuloFormValues) => {
    if (!orden?.id) return;

    createArticuloMutation.mutate(
      {
        idOrden: orden.id,
        payload: {
          referencia: data.referencia,
          linea: Number(data.linea),
          cantidad: Number(data.cantidad),
          descripcion: data.descripcion,
          inicioPlanificado: data.inicioPlanificado
            ? new Date(data.inicioPlanificado).toISOString()
            : undefined,
          finPlanificado: data.finPlanificado
            ? new Date(data.finPlanificado).toISOString()
            : undefined,
        },
      },
      {
        onSuccess: () => {
          setIsAddArticuloDialogOpen(false);
        },
      },
    );
  };

  const { exportOperacion, exportingId } = useExportOperacionPdf(orden);
  const { deleteOperacionMutation } = useOperacionMutations();
  const { deleteArticuloMutation } = useArticulosMutations();
  const { deleteOrdenMutation } = useOrdenesMutations();

  const handleDeleteOperacion = (operacion: OperacionResponse) => {
    if (!window.confirm(`¿Eliminar operación "${operacion.tipoOperacion}"?`)) return;
    deleteOperacionMutation.mutate(operacion.id);
  };

  const handleDeleteArticulo = (articulo: ArticuloOrden) => {
    if (!articulo.id) return;
    if (!window.confirm(`¿Eliminar artículo "${articulo.referencia}"?`)) return;
    deleteArticuloMutation.mutate(articulo.id);
  };

  const handleDeleteOrden = () => {
    if (!orden?.id) return;
    if (!window.confirm(`¿Eliminar la orden "${orden.idNavision}"?`)) return;
    deleteOrdenMutation.mutate(orden.id, {
      onSuccess: () => navigate("/admin/ordenes"),
    });
  };

  const handleOperacionClick = (operacionId: string, tipoOperacion: string) => {
    setSelectedOperacionId(operacionId);
    setSelectedOperacionTipo(tipoOperacion);
  };

  const handleCloseRegistroDialog = () => {
    setSelectedOperacionId(null);
    setSelectedOperacionTipo("");
  };

  return (
    <>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {isOrdenLoading ? (
          <Paper sx={{ p: 5, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Paper>
        ) : isOrdenError ? (
          <Paper sx={{ p: 4 }}>
            <Typography color="error">
              {ordenError?.message || "No se pudo cargar la orden."}
            </Typography>
          </Paper>
        ) : !orden ? (
          <Paper sx={{ p: 4 }}>
            <Typography color="text.secondary">
              No se encontro la orden.
            </Typography>
          </Paper>
        ) : (
          <>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 2,
                  flexWrap: "wrap",
                  mb: 2,
                }}
              >
                <Typography variant="h5">Orden {orden.idNavision}</Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title={articulosOrdenados.length > 0 ? "La orden tiene artículos" : "Eliminar orden"}>
                    <span>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        disabled={articulosOrdenados.length > 0 || deleteOrdenMutation.isPending}
                        onClick={handleDeleteOrden}
                      >
                        Eliminar orden
                      </Button>
                    </span>
                  </Tooltip>
                  <Button variant="outlined" onClick={() => navigate("/admin/ordenes")}>
                    Volver a órdenes
                  </Button>
                </Box>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: 180 }}>
                        Id Navision
                      </TableCell>
                      <TableCell>{orden.idNavision}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Cliente</TableCell>
                      <TableCell>{orden.cliente?.trim() || "-"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Descripcion
                      </TableCell>
                      <TableCell>{orden.descripcion}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={formatEstado(orden.estado)}
                          color={getEstadoColor(orden.estado)}
                          variant="filled"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Articulos y operaciones</Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleOpenAddArticuloDialog}
                disabled={!orden.id}
              >
                + Añadir Artículo
              </Button>
            </Box>

            {isArticulosLoading ? (
              <Paper sx={{ p: 5, display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </Paper>
            ) : isArticulosError ? (
              <Paper sx={{ p: 4 }}>
                <Typography color="error">
                  {articulosError?.message ||
                    "No se pudieron cargar los articulos de la orden."}
                </Typography>
              </Paper>
            ) : articulosOrdenados.length === 0 ? (
              <Paper sx={{ p: 4 }}>
                <Typography color="text.secondary">
                  Esta orden no tiene articulos.
                </Typography>
              </Paper>
            ) : (
              articulosOrdenados.map((articulo) => {
                const operaciones = articulo.id
                  ? (operacionesByArticuloId[articulo.id] ?? [])
                  : [];

                return (
                  <Accordion
                    key={`${articulo.id ?? "sin-id"}-${articulo.linea}`}
                    disableGutters
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            flex: 1,
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              md: "100px 1fr 120px",
                            },
                            gap: 2,
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Linea {articulo.linea}
                          </Typography>
                          <Typography sx={{ fontWeight: 600 }}>
                            {articulo.referencia}{" "}
                            {articulo.descripcion
                              ? `- ${articulo.descripcion}`
                              : ""}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cantidad: {articulo.cantidad}
                          </Typography>
                        </Box>
                        <Tooltip title="Eliminar artículo">
                          <span>
                            <IconButton
                              component="div"
                              size="small"
                              color="error"
                              disabled={
                                operaciones.length > 0 ||
                                deleteArticuloMutation.isPending
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteArticulo(articulo);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mb: 2,
                        }}
                      >
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenCreateDialog(articulo)}
                          disabled={!articulo.id}
                        >
                          + Nueva operacion
                        </Button>
                      </Box>

                      {!articulo.id ? (
                        <Typography color="text.secondary">
                          Este articulo no tiene id y no se pueden consultar
                          operaciones.
                        </Typography>
                      ) : isOperacionesLoading && !operaciones.length ? (
                        <Box
                          sx={{
                            py: 2,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress size={22} />
                        </Box>
                      ) : operaciones.length === 0 ? (
                        <Typography color="text.secondary">
                          No hay operaciones para este articulo.
                        </Typography>
                      ) : (
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Operacion</TableCell>
                                <TableCell>Cantidad total</TableCell>
                                <TableCell>Producida</TableCell>
                                <TableCell>Rechazada</TableCell>
                                <TableCell>Última fase</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Acciones</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {operaciones.map((operacion) => (
                                <TableRow
                                  key={operacion.id}
                                  hover
                                  onClick={() =>
                                    handleOperacionClick(
                                      operacion.id,
                                      operacion.tipoOperacion,
                                    )
                                  }
                                  sx={{ cursor: "pointer" }}
                                >
                                  <TableCell>
                                    {operacion.tipoOperacion}
                                  </TableCell>
                                  <TableCell>
                                    {operacion.cantidadTotal}
                                  </TableCell>
                                  <TableCell>
                                    {operacion.cantidadProducida}
                                  </TableCell>
                                  <TableCell>
                                    {operacion.cantidadRechazada}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      size="small"
                                      label={
                                        operacion.ultimaOperacion ? "✔" : "-"
                                      }
                                      color={
                                        operacion.ultimaOperacion
                                          ? "success"
                                          : "default"
                                      }
                                      variant="filled"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      size="small"
                                      label={formatEstado(String(operacion.estado ?? ""))}
                                      color={getEstadoColor(operacion.estado)}
                                      variant="filled"
                                    />
                                  </TableCell>
                                  <TableCell
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{ width: 96 }}
                                  >
                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                      <Tooltip title="Exportar informe PDF">
                                        <span>
                                          <IconButton
                                            size="small"
                                            disabled={exportingId === operacion.id}
                                            onClick={() => exportOperacion(operacion)}
                                          >
                                            {exportingId === operacion.id ? (
                                              <CircularProgress size={16} />
                                            ) : (
                                              <ArticleIcon fontSize="small" />
                                            )}
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                      <Tooltip title="Eliminar operación">
                                        <span>
                                          <IconButton
                                            size="small"
                                            color="error"
                                            disabled={
                                              deleteOperacionMutation.isPending ||
                                              operacion.cantidadProducida > 0 ||
                                              operacion.cantidadRechazada > 0 ||
                                              operacion.tiempoTotal > 0
                                            }
                                            onClick={() => handleDeleteOperacion(operacion)}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })
            )}
          </>
        )}
      </Container>

      <AdminCreateOperacionDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        articuloId={selectedArticuloId}
        articuloLabel={selectedArticuloLabel}
        tiposOperacionOptions={tiposOperacionOptions}
      />

      {/* COMPONENTE COMPARTIDO: Aquí le pasamos la función para que llame a la API */}
      <AdminAddArticuloDialog
        open={isAddArticuloDialogOpen}
        onClose={() => setIsAddArticuloDialogOpen(false)}
        onSave={handleGuardarArticuloEnAPI}
        isSubmitting={createArticuloMutation.isPending}
        title="Añadir Nuevo Artículo a la Orden"
      />

      <AdminOperacionDialog
        operacionId={selectedOperacionId}
        operacionTipo={selectedOperacionTipo}
        onClose={handleCloseRegistroDialog}
      />
    </>
  );
};
