import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useCreateOrdenMutation,
  useCreateArticuloOrdenMutation,
} from "../../hooks/queries/useOrdenesQueries";
import type { CreateArticuloPayload } from "../../model/aggregates/Ordenes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// IMPORTAMOS EL DIÁLOGO COMPARTIDO
import { AdminAddArticuloDialog, type ArticuloFormValues } from "./components/AdminAddArticuloDialog/AdminAddArticuloDialog";

const ordenSchema = z.object({
  idNavision: z.string().min(1, "El Id Navision es obligatorio"),
  cliente: z.string().min(1, "El Cliente es obligatorio"),
  codigoProcedencia: z.string().min(1, "El Código de Procedencia es obligatorio"),
  descripcion: z.string().optional(),
});

type OrdenFormValues = z.infer<typeof ordenSchema>;

export const AdminCreateOrderPage = () => {
  const navigate = useNavigate();
  const createOrdenMutation = useCreateOrdenMutation();
  const createArticuloMutation = useCreateArticuloOrdenMutation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localArticulos, setLocalArticulos] = useState<CreateArticuloPayload[]>([]);
  const [isArticuloDialogOpen, setIsArticuloDialogOpen] = useState(false);

  // Formulario de la Orden
  const {
    register: registerOrden,
    handleSubmit: handleSubmitOrden,
    formState: { errors: errorsOrden },
  } = useForm<OrdenFormValues>({
    resolver: zodResolver(ordenSchema),
    mode: "onTouched",
    defaultValues: {
      idNavision: "",
      cliente: "",
      codigoProcedencia: "",
      descripcion: "",
    },
  });

  // Función que el DIÁLOGO ejecutará cuando el usuario le dé a Guardar
  const handleAddLocalArticulo = (data: ArticuloFormValues) => {
    const nuevoArticulo: CreateArticuloPayload = {
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
    };

    setLocalArticulos((prev) => [...prev, nuevoArticulo]);
    setIsArticuloDialogOpen(false);
  };

  const handleRemoveLocalArticulo = (indexToRemove: number) => {
    setLocalArticulos((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const onSaveAll = async (data: OrdenFormValues) => {
    setIsSubmitting(true);
    try {
      const nuevaOrden = (await createOrdenMutation.mutateAsync(data)) as unknown;

      let nuevaOrdenId = "";
      if (typeof nuevaOrden === "object" && nuevaOrden !== null) {
        const obj = nuevaOrden as Record<string, unknown>;
        if (typeof obj.id === "string") {
          nuevaOrdenId = obj.id;
        } else if (typeof obj.value === "object" && obj.value !== null) {
          const inner = obj.value as Record<string, unknown>;
          nuevaOrdenId = String(inner.id ?? "");
        }
      }

      if (!nuevaOrdenId) {
        throw new Error("El servidor no devolvió el ID de la nueva orden.");
      }

      if (localArticulos.length > 0) {
        for (const articulo of localArticulos) {
          await createArticuloMutation.mutateAsync({
            idOrden: nuevaOrdenId,
            payload: articulo,
          });
        }
      }

      navigate(`/admin/ordenes/${nuevaOrdenId}`);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {(createOrdenMutation.isError || createArticuloMutation.isError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Hubo un error al procesar la solicitud. Por favor, inténtelo de nuevo.
        </Alert>
      )}

      {/* CABECERA (ORDEN) */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Crear Nueva Orden</Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label="Id Navision *"
            {...registerOrden("idNavision")}
            error={!!errorsOrden.idNavision}
            helperText={errorsOrden.idNavision?.message}
            disabled={isSubmitting}
          />
          <TextField
            fullWidth
            label="Cliente *"
            {...registerOrden("cliente")}
            error={!!errorsOrden.cliente}
            helperText={errorsOrden.cliente?.message}
            disabled={isSubmitting}
          />
          <TextField
            fullWidth
            label="Código Procedencia *"
            {...registerOrden("codigoProcedencia")}
            error={!!errorsOrden.codigoProcedencia}
            helperText={errorsOrden.codigoProcedencia?.message}
            disabled={isSubmitting}
          />
          <TextField
            fullWidth
            label="Descripción"
            {...registerOrden("descripcion")}
            disabled={isSubmitting}
          />
        </Box>
      </Paper>

      {/* LÍNEAS (ARTÍCULOS LOCALES) */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Artículos de la Orden (Borrador)</Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setIsArticuloDialogOpen(true)}
            disabled={isSubmitting}
          >
            + Añadir Artículo
          </Button>
        </Box>

        {localArticulos.length === 0 ? (
          <Typography color="text.secondary">No has añadido artículos todavía.</Typography>
        ) : (
          <TableContainer variant="outlined" component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  <TableCell>Línea</TableCell>
                  <TableCell>Referencia</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {localArticulos.map((art, index) => (
                  <TableRow key={index}>
                    <TableCell>{art.linea}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{art.referencia}</TableCell>
                    <TableCell>{art.descripcion || "-"}</TableCell>
                    <TableCell>{art.cantidad}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveLocalArticulo(index)}
                        disabled={isSubmitting}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={handleSubmitOrden(onSaveAll)}
          disabled={isSubmitting}
          sx={{ px: 5, py: 1.5 }}
        >
          {isSubmitting ? "Guardando..." : "Guardar Orden Completa"}
        </Button>
      </Box>

      {/* USAMOS EL DIÁLOGO COMPARTIDO AQUÍ */}
      <AdminAddArticuloDialog
        open={isArticuloDialogOpen}
        onClose={() => setIsArticuloDialogOpen(false)}
        onSave={handleAddLocalArticulo}
        title="Añadir Artículo al Borrador"
      />
    </Container>
  );
};