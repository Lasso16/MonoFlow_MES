import { IncidenciaDialog } from './IncidenciaDialog';
import { ObservacionDialog } from '../ObservacionDialog/ObservacionDialog';
import { PauseReasonDialog } from './PauseReasonDialog';
import { ProduccionDialog } from './ProduccionDialog';
import { RegistroErrorSnackbar } from '../RegistroErrorSnackbar/RegistroErrorSnackbar';

type TerminalDialogsPanelProps = {
  snackbarProps: React.ComponentProps<typeof RegistroErrorSnackbar>;
  pauseDialogProps: React.ComponentProps<typeof PauseReasonDialog>;
  observacionDialogProps: React.ComponentProps<typeof ObservacionDialog>;
  incidenciaDialogProps: React.ComponentProps<typeof IncidenciaDialog>;
  produccionDialogProps: React.ComponentProps<typeof ProduccionDialog>;
};

export const TerminalDialogsPanel = ({
  snackbarProps,
  pauseDialogProps,
  observacionDialogProps,
  incidenciaDialogProps,
  produccionDialogProps,
}: TerminalDialogsPanelProps) => {
  return (
    <>
      <RegistroErrorSnackbar {...snackbarProps} />

      <PauseReasonDialog {...pauseDialogProps} />

      <ObservacionDialog {...observacionDialogProps} />

      <IncidenciaDialog {...incidenciaDialogProps} />

      <ProduccionDialog {...produccionDialogProps} />
    </>
  );
};