import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

type PauseReasonDialogProps = {
  open: boolean;
  pauseReason: string;
  onClose: () => void;
  onPauseReasonChange: (value: string) => void;
  onConfirm: () => void;
  isConfirmLoading: boolean;
};

export const PauseReasonDialog = ({
  open,
  pauseReason,
  onClose,
  onPauseReasonChange,
  onConfirm,
  isConfirmLoading,
}: PauseReasonDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Iniciar pausa</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Motivo"
          fullWidth
          value={pauseReason}
          onChange={(event) => onPauseReasonChange(event.target.value)}
          placeholder="Almuerzo"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onConfirm} disabled={isConfirmLoading}>
          {isConfirmLoading ? 'Iniciando...' : 'Iniciar pausa'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
