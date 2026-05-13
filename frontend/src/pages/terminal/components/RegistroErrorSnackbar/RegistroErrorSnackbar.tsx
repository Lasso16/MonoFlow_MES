import { Alert, Snackbar } from '@mui/material';

type RegistroErrorSnackbarProps = {
  message: string | null;
  onClose: () => void;
};

export const RegistroErrorSnackbar = ({ message, onClose }: RegistroErrorSnackbarProps) => {
  return (
    <Snackbar
      open={Boolean(message)}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity="warning" variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};
