import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
import { useArticulosMutations } from "../../../../hooks/queries/useArticulosQueries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ESQUEMA DE VALIDACIÓN
const operacionSchema = z.object({
  idTipoOperacion: z.string().min(1, "El Tipo de Operación es obligatorio"),
  
  cantidadComponentes: z
    .string()
    .min(1, "La cantidad de componentes es obligatoria")
    .regex(/^(?:[1-9]\d*)(?:\.\d+)?$/, "Solo se admiten números válidos (1 o mayores)"),
    
  tiempoPlan: z
    .string()
    .min(1, "El tiempo plan es obligatorio")
    .regex(/^(?:[1-9]\d*)(?:\.\d+)?$/, "Solo se admiten números válidos (1 o mayores)"),
    
  ultimaOperacion: z.boolean(),
});

type OperacionFormValues = z.infer<typeof operacionSchema>;

type AdminCreateOperacionDialogProps = {
  open: boolean;
  onClose: () => void;
  articuloId: string;
  articuloLabel: string;
  tiposOperacionOptions: { id: number; label: string }[];
};

export const AdminCreateOperacionDialog = ({
  open,
  onClose,
  articuloId,
  articuloLabel,
  tiposOperacionOptions,
}: AdminCreateOperacionDialogProps) => {
  const { addOperacionArticuloMutation } = useArticulosMutations();

  //CONFIGURACIÓN DEL FORMULARIO
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OperacionFormValues>({
    resolver: zodResolver(operacionSchema),
    mode: "onTouched",
    defaultValues: {
      idTipoOperacion: "",
      cantidadComponentes: "",
      tiempoPlan: "",
      ultimaOperacion: false,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        idTipoOperacion: "",
        cantidadComponentes: "",
        tiempoPlan: "",
        ultimaOperacion: false,
      });
      addOperacionArticuloMutation.reset();
    }
  }, [open]);

  //FUNCIÓN DE GUARDADO
  const onSave = (data: OperacionFormValues) => {
    addOperacionArticuloMutation.mutate(
      {
        idArticulo: articuloId,
        payload: {
          idTipoOperacion: Number(data.idTipoOperacion),
          cantidadComponentes: Number(data.cantidadComponentes),
          tiempoPlan: Number(data.tiempoPlan),
          ultimaOperacion: data.ultimaOperacion,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const isSubmitting = addOperacionArticuloMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nueva operacion para {articuloLabel}</DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
        <FormControl
          fullWidth
          required
          error={!!errors.idTipoOperacion}
          disabled={isSubmitting}
        >
          <InputLabel id="tipo-operacion-label">Tipo de operacion</InputLabel>
          <Select
            labelId="tipo-operacion-label"
            label="Tipo de operacion"
            defaultValue=""
            {...register("idTipoOperacion")}
          >
            {tiposOperacionOptions.length === 0 ? (
              <MenuItem value="" disabled>
                No hay tipos de operacion disponibles
              </MenuItem>
            ) : (
              tiposOperacionOptions.map((tipo) => (
                <MenuItem key={tipo.id} value={String(tipo.id)}>
                  {tipo.label}
                </MenuItem>
              ))
            )}
          </Select>
          {errors.idTipoOperacion && (
            <FormHelperText>{errors.idTipoOperacion.message}</FormHelperText>
          )}
        </FormControl>

        <TextField
          label="Cantidad componentes *"
          fullWidth
          disabled={isSubmitting}
          {...register("cantidadComponentes")}
          error={!!errors.cantidadComponentes}
          helperText={errors.cantidadComponentes?.message}
          slotProps={{ htmlInput: { inputMode: 'decimal' } }}
        />

        <TextField
          label="Tiempo plan *"
          fullWidth
          disabled={isSubmitting}
          {...register("tiempoPlan")}
          error={!!errors.tiempoPlan}
          helperText={errors.tiempoPlan?.message}
          slotProps={{ htmlInput: { inputMode: 'decimal' } }}
        />

        <FormControlLabel
          control={
            <Checkbox
              disabled={isSubmitting}
              {...register("ultimaOperacion")}
            />
          }
          label="Marcar como última operacion"
        />

        {/* ERRORES DEL SERVIDOR */}
        {addOperacionArticuloMutation.isError && (
          <Alert severity="error">
            {addOperacionArticuloMutation.error?.message ||
              "No se pudo crear la operacion."}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSave)}
          disabled={isSubmitting || tiposOperacionOptions.length === 0}
        >
          {isSubmitting ? "Creando..." : "Crear operacion"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
