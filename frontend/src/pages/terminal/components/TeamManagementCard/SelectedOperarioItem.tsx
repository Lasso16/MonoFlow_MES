import { IconButton, ListItem, ListItemText } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import styles from './TeamManagementCard.module.css';import type { Operario } from '../../../../model/aggregates/Operarios';

type Props = {
  operario: Operario;
  onRequestRemove: (operario: Operario) => void;
  disabled?: boolean;
};

export const SelectedOperarioItem = ({ operario, onRequestRemove, disabled }: Props) => (
  <ListItem
    className={styles['team-selected-row']}
    secondaryAction={
      <IconButton
        edge="end"
        size="small"
        disabled={disabled}
        onClick={() => onRequestRemove(operario)}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    }
  >
    <ListItemText
      primary={`${operario.numeroOperario} - ${operario.nombre}`}
      secondary={operario.rol}
    />
  </ListItem>
);