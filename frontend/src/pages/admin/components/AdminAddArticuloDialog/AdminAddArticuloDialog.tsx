import { useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ESQUEMA DE VALIDACIÓN
const articuloSchema = z.object({
  referencia: z.string().min(1, "La Referencia es obligatoria"),

  linea: z
    .string()
    .min(1, "La línea es obligatoria")
    .regex(/^\d+(\.\d+)?$/, "Solo se admiten números")
    .refine((val) => Number(val) > 0, "Debe ser mayor a 0"),

  cantidad: z
    .string()
    .min(1, "La cantidad es obligatoria")
    .regex(/^\d+(\.\d+)?$/, "Solo se admiten números")
    .refine((val) => Number(val) > 0, "Debe ser mayor a 0"),

  descripcion: z.string().optional(),
  inicioPlanificado: z.string().optional(),
  finPlanificado: z.string().optional(),
});

export type ArticuloFormValues = z.infer<typeof articuloSchema>;

// PROPS DEL COMPONENTE
type AdminAddArticuloDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: ArticuloFormValues) => void;
  isSubmitting?: boolean;
  title?: string;
};

export const AdminAddArticuloDialog = ({
  open,
  onClose,
  onSave,
  isSubmitting = false,
  title = "Añadir Nuevo Artículo",
}: AdminAddArticuloDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ArticuloFormValues>({
    resolver: zodResolver(articuloSchema),
    mode: "onTouched",
    defaultValues: {
      referencia: "",
      linea: "",
      cantidad: "",
      descripcion: "",
      inicioPlanificado: "",
      finPlanificado: "",
    },
  });

  // Limpiar el formulario SOLO al abrir el diálogo (evita bucles)
  useEffect(() => {
    if (open) {
      reset({
        referencia: "",
        linea: "",
        cantidad: "",
        descripcion: "",
        inicioPlanificado: "",
        finPlanificado: "",
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 2,
            mt: 1,
          }}
        >
          <Box sx={{ gridColumn: "span 8" }}>
            <TextField
              fullWidth
              label="Referencia *"
              {...register("referencia")}
              error={!!errors.referencia}
              helperText={errors.referencia?.message}
              disabled={isSubmitting}
            />
          </Box>
          <Box sx={{ gridColumn: "span 4" }}>
            <TextField
              fullWidth
              label="Línea *"
              {...register("linea")}
              error={!!errors.linea}
              helperText={errors.linea?.message}
              disabled={isSubmitting}
              slotProps={{ htmlInput: { inputMode: "decimal" } }}
            />
          </Box>
          <Box sx={{ gridColumn: "span 12" }}>
            <TextField
              fullWidth
              label="Descripción"
              {...register("descripcion")}
              disabled={isSubmitting}
            />
          </Box>
          <Box sx={{ gridColumn: "span 12" }}>
            <TextField
              fullWidth
              label="Cantidad *"
              {...register("cantidad")}
              error={!!errors.cantidad}
              helperText={errors.cantidad?.message}
              disabled={isSubmitting}
              slotProps={{ htmlInput: { inputMode: "decimal" } }}
            />
          </Box>
          <Box sx={{ gridColumn: "span 6" }}>
            <TextField
              fullWidth
              label="Inicio Planificado"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              {...register("inicioPlanificado")}
              disabled={isSubmitting}
            />
          </Box>
          <Box sx={{ gridColumn: "span 6" }}>
            <TextField
              fullWidth
              label="Fin Planificado"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              {...register("finPlanificado")}
              disabled={isSubmitting}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSave)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar Artículo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
