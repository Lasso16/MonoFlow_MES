import { Box, Chip, LinearProgress, Paper, Tooltip, Typography } from '@mui/material';
import { memo, type ReactNode } from 'react';
import type {
  OperacionProgresoResponse,
  OperacionResponse,
} from '../../../../model/aggregates/Operaciones';
import type { RegistroActualOperacionDTO } from '../../../../model/aggregates/RegistroTrabajo';
import styles from './OperationDataCard.module.css';

type OperationDataCardProps = {
  operacion?: OperacionResponse;
  progreso?: OperacionProgresoResponse;
  registroActualOperacion?: RegistroActualOperacionDTO;
  cliente?: string;
  descripcionArticulo?: string;
  operationSelectorControl?: ReactNode;
};

type RegistroItem = {
  id: string;
  cantidad: number;
  hora: string;
};

const formatHora = (value?: string): string => {
  if (!value) return '--:--:--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--:--:--';
  return parsed.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const toRegistroItems = (entries: unknown, prefix: string): RegistroItem[] => {
  if (!Array.isArray(entries)) return [];

  return entries.map((entry, index) => {
    const data = entry as {
      cantidad?: number;
      Cantidad?: number;
      timestamp?: string;
      Timestamp?: string;
    };

    return {
      id: `${prefix}-${index}`,
      cantidad: Number(data.cantidad ?? data.Cantidad ?? 0),
      hora: formatHora(data.timestamp ?? data.Timestamp),
    };
  });
};

const RegistroDetalleTooltip = ({
  title,
  items,
}: {
  title: string;
  items: RegistroItem[];
}) => {
  return (
    <Box className={styles['operation-chip-tooltip']}>
      <Typography className={styles['operation-chip-tooltip-title']}>{title}</Typography>
      {items.length === 0 ? (
        <Typography className={styles['operation-chip-tooltip-empty']}>Aun no se ha registrado.</Typography>
      ) : (
        <Box className={styles['operation-chip-tooltip-list']}>
          <Box className={`${styles['operation-chip-tooltip-row']} ${styles['operation-chip-tooltip-head']}`}>
            <span>Hora</span>
            <span>Cantidad</span>
          </Box>
          {items.map((item) => (
            <Box key={item.id} className={styles['operation-chip-tooltip-row']}>
              <span>{item.hora}</span>
              <span>{item.cantidad.toLocaleString('es-ES')}</span>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

const DataRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <Box className={styles['operation-data-row']}>
      <Typography variant="caption" color="text.secondary" className={styles['operation-data-row-label']}>
        {label}
      </Typography>
      <Typography variant="body2" className={styles['operation-data-row-value']}>
        {value}
      </Typography>
    </Box>
  );
};

export const OperationDataCard = memo(({
  operacion,
  progreso,
  registroActualOperacion,
  cliente,
  descripcionArticulo,
  operationSelectorControl,
}: OperationDataCardProps) => {
  const hasOperacion = Boolean(operacion);
  const clienteValue = hasOperacion ? cliente?.trim() || '-' : '-';
  const descripcionValue = hasOperacion ? descripcionArticulo?.trim() || '-' : '-';
  const tipoOperacion = hasOperacion ? operacion?.tipoOperacion?.trim() || '-' : '-';
  const producidasValue = hasOperacion
    ? (operacion?.cantidadProducida ?? 0).toLocaleString('es-ES')
    : '-';
  const rechazadasValue = hasOperacion
    ? (operacion?.cantidadRechazada ?? 0).toLocaleString('es-ES')
    : '-';
  const porcentaje = progreso?.porcentaje ?? operacion?.progreso ?? 0;
  const produccionesItems = toRegistroItems(registroActualOperacion?.producciones, 'produccion');
  const rechazosItems = toRegistroItems(registroActualOperacion?.rechazos, 'rechazo');

  return (
    <Paper variant="outlined" className={styles['operation-card']}>
      <Box className={styles['operation-card-header']}>
        <Typography variant="overline" color="text.secondary" className={styles['operation-card-title']}>
          Datos de la Operacion
        </Typography>

        <Box className={styles['operation-header-action-wrap']}>{operationSelectorControl}</Box>
      </Box>

      <Box className={styles['operation-card-body']}>
        <DataRow label="Cliente" value={clienteValue} />
        <DataRow label="Descripcion" value={descripcionValue} />
        <DataRow label="Tipo de Operacion" value={tipoOperacion} />

        

        <Box className={styles['operation-goal-wrap']}>
          <Typography variant="caption" color="text.secondary" className={styles['operation-data-row-label']}>
            Cant. Objetivo
          </Typography>
          <Box className={styles['operation-goal-row']}>
            <Typography variant="body2" className={styles['operation-goal-units']}>
              {(operacion?.cantidadTotal ?? 0).toLocaleString('es-ES')} Unidades
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.max(0, Math.min(100, porcentaje))}
              className={styles['operation-goal-progress']}
            />
            <Typography variant="caption" color="text.secondary" className={styles['operation-goal-percent']}>
              {porcentaje.toFixed(2)}%
            </Typography>
          </Box>

          <Box className={styles['operation-tag-row']}>
            <Tooltip
              arrow
              placement="top"
              title={<RegistroDetalleTooltip title="Producciones" items={produccionesItems} />}
            >
              <Chip
                label={`Producidas: ${producidasValue}`}
                color="success"
                size="small"
                className={styles['operation-count-chip']}
              />
            </Tooltip>

            <Tooltip
              arrow
              placement="top"
              title={<RegistroDetalleTooltip title="Rechazos" items={rechazosItems} />}
            >
              <Chip
                label={`Rechazadas: ${rechazadasValue}`}
                color="error"
                size="small"
                className={styles['operation-count-chip']}
              />
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
});
