import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

type ObservacionDialogProps = {
  open: boolean;
  observacion: string;
  onClose: () => void;
  onObservacionChange: (value: string) => void;
  onConfirm: () => void;
  isConfirmLoading: boolean;
};

export const ObservacionDialog = ({
  open,
  observacion,
  onClose,
  onObservacionChange,
  onConfirm,
  isConfirmLoading,
}: ObservacionDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Añadir observación</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Observación"
          fullWidth
          multiline
          minRows={3}
          value={observacion}
          onChange={(event) => onObservacionChange(event.target.value)}
          placeholder="Escribe una observación del registro"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onConfirm} disabled={isConfirmLoading || !observacion.trim()}>
          {isConfirmLoading ? 'Enviando...' : 'Enviar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
