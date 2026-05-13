import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import { Box, Paper, Typography } from '@mui/material';
import { memo } from 'react';

// ==========================================
// 1. TIPOS
// ==========================================
type ToneType = 'start' | 'incident' | 'pause' | 'note' | 'produce' | 'finish';

export type TerminalControlsGridProps = {
  onStart?: () => void;
  startLabel?: string;
  isIniciarDisabled?: boolean;
  isIniciarLoading?: boolean;
  onIncident?: () => void;
  incidentLabel?: string;
  isIncidentDisabled?: boolean;
  isIncidentLoading?: boolean;
  onNote?: () => void;
  noteLabel?: string;
  isNoteDisabled?: boolean;
  isNoteLoading?: boolean;
  onProduce?: () => void;
  produceLabel?: string;
  isProduceDisabled?: boolean;
  isProduceLoading?: boolean;
  onPause?: () => void;
  pauseLabel?: string;
  isPauseDisabled?: boolean;
  isPauseLoading?: boolean;
  showFinalizar?: boolean;
  onFinalizar?: () => void;
  isFinalizarDisabled?: boolean;
  isFinalizarLoading?: boolean;
  isAllDisabled?: boolean;
  lockNonPauseActions?: boolean;
  allowIncidentWhenLocked?: boolean;
};

// ==========================================
// 2. SUBCOMPONENTE: TARJETA DE CONTROL
// ==========================================
type TerminalControlButtonProps = {
  label: string;
  icon: React.ReactNode;
  tone: ToneType;
  onClick?: () => void;
  isDisabled: boolean;
};

const toneStyles: Record<ToneType, object> = {
  start: { bgcolor: '#ecfdf3', borderColor: '#86efac', color: '#166534' },
  pause: { bgcolor: '#fefce8', borderColor: '#fde047', color: '#854d0e' },
  incident: { bgcolor: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b' },
  finish: { bgcolor: '#f1f5f9', borderColor: '#cbd5e1', color: '#334155' },
  note: { bgcolor: 'common.white', borderColor: '#cbd5e1', color: '#475569' },
  produce: { bgcolor: '#0f172a', borderColor: '#0f172a', color: 'common.white' },
};

const TerminalControlButton = memo(({ label, icon, tone, onClick, isDisabled }: TerminalControlButtonProps) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: '18px 8px',
        borderRadius: '10px',
        textAlign: 'center',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.55 : 1,
        ...toneStyles[tone],
      }}
      onClick={!isDisabled ? onClick : undefined}
      role="button"
      tabIndex={0}
      aria-disabled={isDisabled}
    >
      {icon}
      <Typography
        variant="caption"
        sx={{
          mt: 1,
          display: 'block',
          fontWeight: 800,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>
    </Paper>
  );
});

// ==========================================
// 3. COMPONENTE PRINCIPAL: GRID
// ==========================================
export const TerminalControlsGrid = memo((props: TerminalControlsGridProps) => {
  
  // Función para centralizar la compleja lógica de los bloqueos
  const isActionLocked = (actionKey: ToneType) => {
    if (props.isAllDisabled) return true;
    if (actionKey === 'pause') return false; // La pausa nunca se ve afectada por el bloqueo general
    if (actionKey === 'incident' && props.allowIncidentWhenLocked) return false;
    return props.lockNonPauseActions ?? false;
  };

  // Construimos el array de botones de forma declarativa e inyectando las props
  const buttonConfigs: TerminalControlButtonProps[] = [
    {
      tone: 'start',
      label: props.isIniciarLoading ? 'Enviando...' : (props.startLabel || 'Iniciar'),
      icon: <PlayArrowIcon fontSize="large" />,
      onClick: props.onStart,
      isDisabled: isActionLocked('start') || (props.isIniciarDisabled ?? false),
    },
    {
      tone: 'incident',
      label: props.isIncidentLoading ? 'Enviando...' : (props.incidentLabel || 'Incidencia'),
      icon: <ReportGmailerrorredIcon fontSize="large" />,
      onClick: props.onIncident,
      isDisabled: isActionLocked('incident') || (props.isIncidentDisabled ?? false),
    },
    {
      tone: 'pause',
      label: props.isPauseLoading ? 'Procesando...' : (props.pauseLabel || 'Pausar'),
      icon: props.pauseLabel?.toLowerCase().includes('reanudar') ? <PlayArrowIcon fontSize="large" /> : <PauseIcon fontSize="large" />,
      onClick: props.onPause,
      isDisabled: isActionLocked('pause') || (props.isPauseDisabled ?? false),
    },
    {
      tone: 'note',
      label: props.isNoteLoading ? 'Enviando...' : (props.noteLabel || 'Añadir Observaciones'),
      icon: <EditNoteOutlinedIcon fontSize="large" />,
      onClick: props.onNote,
      isDisabled: isActionLocked('note') || (props.isNoteDisabled ?? false),
    },
    {
      tone: 'produce',
      label: props.isProduceLoading ? 'Enviando...' : (props.produceLabel || 'Marcar Produccion'),
      icon: <CheckCircleIcon fontSize="large" />,
      onClick: props.onProduce,
      isDisabled: isActionLocked('produce') || (props.isProduceDisabled ?? false),
    },
  ];

  // Según tu código original, si showFinalizar es true, reemplaza el primer botón ("Iniciar")
  if (props.showFinalizar) {
    buttonConfigs[0] = {
      tone: 'finish',
      label: props.isFinalizarLoading ? 'Finalizando...' : 'Finalizar',
      icon: <StopCircleOutlinedIcon fontSize="large" />,
      onClick: props.onFinalizar,
      isDisabled: isActionLocked('finish') || (props.isFinalizarDisabled ?? false),
    };
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 1.5,
        width: 1,
      }}
    >
      {buttonConfigs.map((config) => (
        <TerminalControlButton key={config.tone} {...config} />
      ))}
    </Box>
  );
});