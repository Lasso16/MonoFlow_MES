import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ESTADOS } from "../../../../utils/estadoArticulosUtils";

const ESTADO_OPTIONS = [
  { label: "Pendiente", value: ESTADOS.PENDIENTE },
  { label: "En curso", value: ESTADOS.EN_CURSO },
  { label: "Finalizadas", value: ESTADOS.FINALIZADA },
] as const;

type OrdersFilterPanelProps = {
  filters: {
    estados: string[];
    idNavision: string;
    cliente: string;
  };
  onToggleEstado: (estado: string) => void;
  onIdNavisionInputChange: (value: string) => void;
  onClienteInputChange: (value: string) => void;
  onResetFilters: () => void;
};

export const OrdersFilterPanel = ({
  filters,
  onToggleEstado,
  onIdNavisionInputChange,
  onClienteInputChange,
  onResetFilters,
}: OrdersFilterPanelProps) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Estado
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {ESTADO_OPTIONS.map((estado) => (
              <Chip
                key={estado.value}
                label={estado.label}
                clickable
                color={
                  filters.estados.includes(estado.value)
                    ? "primary"
                    : "default"
                }
                variant={
                  filters.estados.includes(estado.value)
                    ? "filled"
                    : "outlined"
                }
                onClick={() => onToggleEstado(estado.value)}
              />
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            label="Id Navision"
            value={filters.idNavision}
            onChange={(event) => onIdNavisionInputChange(event.target.value)}
            fullWidth
          />
          <TextField
            label="Cliente"
            value={filters.cliente}
            onChange={(event) => onClienteInputChange(event.target.value)}
            fullWidth
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ alignSelf: "center" }}
          >
            Filtros activos: {filters.estados.length} estado(s)
            {filters.idNavision.trim() ? " · Id Navision" : ""}
            {filters.cliente.trim() ? " · Cliente" : ""}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={onResetFilters}>
              Limpiar
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};