import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

interface Props {
  referencia: string;
  setReferencia: (v: string) => void;
  descripcion: string;
  setDescripcion: (v: string) => void;
  estado: string;
  setEstado: (v: string) => void;
}

export const PlantStatusFilters = ({ referencia, setReferencia, descripcion, setDescripcion, estado, setEstado }: Props) => (
  <Box sx={{ p: 2, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 240px" }, gap: 2, borderBottom: "1px solid", borderColor: "divider" }}>
    <TextField size="small" label="Referencia" value={referencia} onChange={(e) => setReferencia(e.target.value)} fullWidth />
    <TextField size="small" label="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} fullWidth />
    <FormControl size="small" fullWidth>
      <InputLabel>Estado</InputLabel>
      <Select value={estado} label="Estado" onChange={(e) => setEstado(String(e.target.value))}>
        <MenuItem value="">Todos</MenuItem>
        <MenuItem value="1">En curso</MenuItem>
        <MenuItem value="0">Pendiente</MenuItem>
      </Select>
    </FormControl>
  </Box>
);