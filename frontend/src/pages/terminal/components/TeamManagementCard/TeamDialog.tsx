import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import type { Operario } from '../../../../model/aggregates/Operarios';

type TeamDialogsProps = {
  operarioToRemove: Operario | null;
  operarioToAdd: Operario | null;
  isAddingPending: boolean;
  onCancelRemove: () => void;
  onConfirmRemove: () => void;
  onCancelAdd: () => void;
  onConfirmAdd: () => void;
};

export const TeamDialogs = ({
  operarioToRemove,
  operarioToAdd,
  isAddingPending,
  onCancelRemove,
  onConfirmRemove,
  onCancelAdd,
  onConfirmAdd,
}: TeamDialogsProps) => (
  <>
    <Dialog open={Boolean(operarioToRemove)} onClose={onCancelRemove} fullWidth maxWidth="xs">
      <DialogTitle>Quitar operario</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Deseas quitar a {operarioToRemove?.nombre} del equipo?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelRemove}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={onConfirmRemove}>Eliminar</Button>
      </DialogActions>
    </Dialog>

    <Dialog open={Boolean(operarioToAdd)} onClose={onCancelAdd} fullWidth maxWidth="xs">
      <DialogTitle>Añadir operario</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Deseas añadir a {operarioToAdd?.nombre} al equipo activo?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelAdd}>Cancelar</Button>
        <Button color="primary" variant="contained" onClick={onConfirmAdd} disabled={isAddingPending}>
          {isAddingPending ? 'Añadiendo...' : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  </>
);