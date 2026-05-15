import {
  Alert,
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
import type { TipoRechazo } from '../../../../model/aggregates/Maestros';

type ProduccionDialogProps = {
  open: boolean;
  piezasBuenas: string;
  piezasRechazadas: string;
  selectedRechazoId: string;
  rechazoComentario: string;
  tiposRechazo: TipoRechazo[];
  errorMessage?: string | null;
  onClose: () => void;
  onPiezasBuenasChange: (value: string) => void;
  onPiezasRechazadasChange: (value: string) => void;
  onSelectedRechazoIdChange: (value: string) => void;
  onRechazoComentarioChange: (value: string) => void;
  onConfirm: () => void;
  isConfirmLoading: boolean;
};

const toNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const ProduccionDialog = ({
  open,
  piezasBuenas,
  piezasRechazadas,
  selectedRechazoId,
  rechazoComentario,
  tiposRechazo,
  errorMessage,
  onClose,
  onPiezasBuenasChange,
  onPiezasRechazadasChange,
  onSelectedRechazoIdChange,
  onRechazoComentarioChange,
  onConfirm,
  isConfirmLoading,
}: ProduccionDialogProps) => {
  const rechazadasCount = toNumber(piezasRechazadas);
  const hasRechazos = rechazadasCount > 0;
  const hasAnyCantidad = piezasBuenas.trim() !== '' || piezasRechazadas.trim() !== '';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Marcar producción</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Piezas buenas"
          type="number"
          fullWidth
          value={piezasBuenas}
          onChange={(event) => onPiezasBuenasChange(event.target.value)}
          slotProps={{ htmlInput: { min: 0 } }}
        />

        <TextField
          margin="dense"
          label="Piezas rechazadas"
          type="number"
          fullWidth
          value={piezasRechazadas}
          onChange={(event) => onPiezasRechazadasChange(event.target.value)}
          slotProps={{ htmlInput: { min: 0 } }}
        />

        {hasRechazos && (
          <>
            <FormControl fullWidth margin="dense">
              <InputLabel id="rechazo-select-label">Motivo de rechazo</InputLabel>
              <Select
                labelId="rechazo-select-label"
                label="Motivo de rechazo"
                value={selectedRechazoId}
                onChange={(event) => onSelectedRechazoIdChange(String(event.target.value))}
              >
                {tiposRechazo.map((rechazo) => (
                  <MenuItem key={rechazo.id} value={String(rechazo.id)}>
                    {rechazo.tipo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="dense"
              label="Comentario"
              fullWidth
              multiline
              minRows={2}
              value={rechazoComentario}
              onChange={(event) => onRechazoComentarioChange(event.target.value)}
              placeholder="Comentario opcional"
            />
          </>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {errorMessage}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={
            isConfirmLoading ||
            !hasAnyCantidad ||
            (hasRechazos && !selectedRechazoId)
          }
        >
          {isConfirmLoading ? 'Enviando...' : 'Enviar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
