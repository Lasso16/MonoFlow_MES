import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { useGetOperacionesArticulo } from '../../../../hooks/queries/useOperacionesQueries';
import { getEstadoKind, getEstadoLabel } from '../../../../utils/estadoArticulosUtils';
import type { ArticuloResponse } from '../../../../model/aggregates/Articulos';
import styles from './ProjectScopeCard.module.css';
import { getCantidadOperacionesArticulo, getScopeChipClass, getProgresoLabel } from './ProjectScopeUtils';

type ArticuloAccordionProps = {
  articulo: ArticuloResponse;
  selectedOperacionId?: string;
  onSelectOperacion?: (operacionId: string) => void;
  queryClient?: ReturnType<typeof useQueryClient>;
};

export const ArticuloAccordion = ({
  articulo,
  selectedOperacionId,
  onSelectOperacion,
  queryClient,
}: ArticuloAccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const articuloEstado = getEstadoKind(articulo.estado);

  const {
    data: articuloOperaciones = [],
    isLoading: isLoadingOperaciones,
    isError: isErrorOperaciones,
    refetch: refetchOperaciones,
  } = useGetOperacionesArticulo(isExpanded ? articulo.id : '');

  const operacionesLabelCount = getCantidadOperacionesArticulo(articulo, articuloOperaciones.length);

  useEffect(() => {
    if (isExpanded) {
      queryClient?.invalidateQueries({ queryKey: ['operaciones-articulo', articulo.id] });
      refetchOperaciones();
    }
  }, [isExpanded, articulo.id, queryClient, refetchOperaciones]);

  const handleSelectOperacion = (operacionId: string) => {
    queryClient?.invalidateQueries({ queryKey: ['operaciones-articulo', articulo.id] });
    onSelectOperacion?.(operacionId);
  };

  return (
    <Accordion
      disableGutters
      className={styles['scope-article-row']}
      expanded={isExpanded}
      onChange={(_, expanded) => setIsExpanded(expanded)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box className={styles['scope-accordion-summary']}>
          <Typography className={styles['scope-article-title']}>
            {articulo.referencia} - {articulo.descripcion || 'Sin descripción'}
          </Typography>
          <Box className={styles['scope-article-meta']}>
            <Chip
              size="small"
              label={getEstadoLabel(articuloEstado, articulo.estado)}
              className={getScopeChipClass(articuloEstado)}
            />
            <Typography variant="caption" color="text.secondary">
              {`${operacionesLabelCount} operaciones`}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        {isLoadingOperaciones ? (
          <Box className={styles['scope-dialog-state-wrap']}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">Cargando...</Typography>
          </Box>
        ) : isErrorOperaciones ? (
          <Typography variant="body2" color="error">Error al cargar operaciones.</Typography>
        ) : (
          <List dense disablePadding>
            {articuloOperaciones.map((operacion) => (
              <ListItem key={operacion.id} className={styles['scope-operation-item']} disablePadding>
                <ListItemButton
                  className={`${styles['scope-operation-button']} ${selectedOperacionId === operacion.id ? styles['scope-operation-selected'] : ''}`}
                  onClick={() => handleSelectOperacion(operacion.id)}
                >
                  <ListItemText
                    primary={operacion.tipoOperacion}
                    secondary={`Progreso: ${getProgresoLabel(operacion)}`}
                  />
                  <Box className={styles['scope-operation-meta']}>
                    {operacion.ultimaOperacion && (
                      <Chip size="small" label="Última fase" className={`${styles['scope-chip']} ${styles['scope-chip-finproduccion']}`} />
                    )}
                    <Chip
                      size="small"
                      label={getEstadoLabel(getEstadoKind(operacion.estado), operacion.estado, 'operacion')}
                      className={getScopeChipClass(getEstadoKind(operacion.estado))}
                    />
                    <ChevronRightIcon className={styles['scope-operation-hint-icon']} />
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </AccordionDetails>
    </Accordion>
  );
};