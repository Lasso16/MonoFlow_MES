import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import type { TipoIncidencia } from '../../../../model/aggregates/Maestros';

type IncidenciaDialogProps = {
  open: boolean;
  incidencias: TipoIncidencia[];
  selectedIncidenciaId: string;
  comentario: string;
  onClose: () => void;
  onSelectedIncidenciaIdChange: (value: string) => void;
  onComentarioChange: (value: string) => void;
  onConfirm: () => void;
  isConfirmLoading: boolean;
};

export const IncidenciaDialog = ({
  open,
  incidencias,
  selectedIncidenciaId,
  comentario,
  onClose,
  onSelectedIncidenciaIdChange,
  onComentarioChange,
  onConfirm,
  isConfirmLoading,
}: IncidenciaDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Registrar incidencia</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense">
          <InputLabel id="incidencia-select-label">Motivo</InputLabel>
          <Select
            labelId="incidencia-select-label"
            label="Motivo"
            value={selectedIncidenciaId}
            onChange={(event) => onSelectedIncidenciaIdChange(String(event.target.value))}
          >
            {incidencias.map((incidencia) => (
              <MenuItem key={incidencia.id} value={String(incidencia.id)}>
                {incidencia.tipo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          margin="dense"
          label="Comentario"
          fullWidth
          multiline
          minRows={3}
          value={comentario}
          onChange={(event) => onComentarioChange(event.target.value)}
          placeholder="Añade un comentario opcional"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={isConfirmLoading || !selectedIncidenciaId}
        >
          {isConfirmLoading ? 'Enviando...' : 'Enviar incidencia'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
