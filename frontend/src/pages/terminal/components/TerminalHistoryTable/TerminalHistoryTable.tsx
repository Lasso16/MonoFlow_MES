import { Box, Chip, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { memo, useState } from 'react';

import type { TerminalHistoryTableProps } from './TerminalHistoryTable.types';
import { formatDuracion, formatHora, getHistoryChipClass, getHistoryLiveClass } from './TerminalHistoryTable.utils';
import styles from './TerminalHistoryTable.module.css';
import { useTerminalHistoryData } from '../../hooks/useTerminalHistoryData';

// Subcomponente para los mensajes de estado (Cargando, Error, Vacío) para no ensuciar la tabla principal
const StatusRow = ({ children }: { children: React.ReactNode }) => (
  <TableRow>
    <TableCell colSpan={4}>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
        {children}
      </Typography>
    </TableCell>
  </TableRow>
);

export const TerminalHistoryTable = memo(({
  operacionId,
  registroActualOperacion,
  isRegistroActualOperacionLoading = false,
  isRegistroActualOperacionError = false,
}: TerminalHistoryTableProps) => {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  
  // ¡Aquí usamos nuestro nuevo Custom Hook!
  const { eventosVisibles, hasMultipleEvents, totalEventos } = useTerminalHistoryData(registroActualOperacion, isHistoryExpanded);

  return (
    <Paper variant="outlined" className={styles['history-card']}>
      <Box className={styles['history-header']}>
        <Typography variant="overline" color="text.primary" className={styles['history-title']}>
          Registro de Eventos e Historial
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Evento</TableCell>
              <TableCell>Hora de inicio</TableCell>
              <TableCell>Hora fin</TableCell>
              <TableCell>Duración</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {/* LÓGICA DE ESTADOS */}
            {isRegistroActualOperacionLoading && (
              <StatusRow>
                <CircularProgress size={18} sx={{ mr: 1, verticalAlign: 'middle' }} /> Cargando registro de eventos...
              </StatusRow>
            )}
            
            {!isRegistroActualOperacionLoading && isRegistroActualOperacionError && (
              <StatusRow>No hay registro de trabajo activo para esta operacion.</StatusRow>
            )}
            
            {!isRegistroActualOperacionLoading && !isRegistroActualOperacionError && !operacionId && (
              <StatusRow>Selecciona una operacion para ver su registro de eventos.</StatusRow>
            )}
            
            {!isRegistroActualOperacionLoading && !isRegistroActualOperacionError && operacionId && totalEventos === 0 && (
              <StatusRow>El registro actual no tiene eventos todavia.</StatusRow>
            )}

            {/* RENDERIZADO DE FILAS REALES */}
            {!isRegistroActualOperacionLoading && totalEventos > 0 && (
              <>
                {eventosVisibles.map((evento) => (
                  <TableRow key={evento.id} hover>
                    <TableCell>
                      <Chip size="small" label={evento.tipoEvento} className={getHistoryChipClass(evento.color)} />
                    </TableCell>
                    <TableCell className={styles['history-time']}>{formatHora(evento.inicio)}</TableCell>
                    <TableCell className={styles['history-time']}>{evento.fin ? formatHora(evento.fin) : 'En curso'}</TableCell>
                    <TableCell className={`${styles['history-time']} ${evento.fin ? '' : styles['history-live-cell']}`}>
                      {evento.fin ? formatDuracion(evento.duracionMs) : (
                        <Box className={getHistoryLiveClass(evento.color)}>
                          <Box className={styles['history-live-dot']} />
                          <Typography className={styles['history-live-value']}>{formatDuracion(evento.duracionMs)}</Typography>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                
                {hasMultipleEvents && (
                  <TableRow hover className={styles['history-toggle-row']} onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}>
                    <TableCell colSpan={4}>
                      <Typography variant="body2" className={styles['history-toggle-text']}>
                        {isHistoryExpanded ? 'Ocultar historial de eventos' : 'Ver todo el historial de eventos'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
});