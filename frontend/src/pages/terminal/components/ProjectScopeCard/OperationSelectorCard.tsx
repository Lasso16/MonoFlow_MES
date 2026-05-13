import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton,
  List, ListItemButton, ListItemText, Paper, TextField, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ClearRounded from '@mui/icons-material/ClearRounded';
import DensityMediumRounded from '@mui/icons-material/DensityMediumRounded';

import { useApi } from '../../../../api/useApi';
import { useGetArticulos } from '../../../../hooks/queries/useArticulosQueries';
import { useGetOperarios } from '../../../../hooks/queries/useOperariosQueries';
import type { Operario } from '../../../../model/aggregates/Operarios';
import type { RegistroActivoOperarioResponse } from '../../../../model/aggregates/RegistroTrabajo';
import { isArticuloVisible } from '../../../../utils/estadoArticulosUtils';
import { ArticuloAccordion } from './ArticuloAccordion';
import styles from './ProjectScopeCard.module.css';

type OperationSelectorCardProps = {
  selectedOperacionId?: string;
  onSelectOperacion?: (operacionId: string) => void;
  onClearOperacion?: () => void;
  buttonOnly?: boolean;
};

const extractRegistroActivo = (payload: unknown): RegistroActivoOperarioResponse => {
  if (payload && typeof payload === 'object') {
    const data = payload as { value?: unknown };
    if (data.value && typeof data.value === 'object') {
      return data.value as RegistroActivoOperarioResponse;
    }
  }
  return payload as RegistroActivoOperarioResponse;
};

export const OperationSelectorCard = ({
  selectedOperacionId,
  onSelectOperacion,
  onClearOperacion,
  buttonOnly = false,
}: OperationSelectorCardProps) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isCheckingRegistro, setIsCheckingRegistro] = useState(false);
  const [showNoRegistroAlert, setShowNoRegistroAlert] = useState(false);

  const { data: articulos = [], isLoading, isError, refetch } = useGetArticulos(1, 500, { soloPendientes: true });
  const { data: allOperarios = [] } = useGetOperarios();
  const { getRegistroActivoOperario } = useApi();

  const articulosNoFinalizados = useMemo(() => articulos.filter(isArticuloVisible), [articulos]);

  const term = searchText.trim().toLowerCase();
  const operariosEncontrados = useMemo<Operario[]>(() => {
    if (term === '') return [];
    return allOperarios.filter((op) =>
      op.nombre.toLowerCase().includes(term) || String(op.numeroOperario).includes(term),
    );
  }, [allOperarios, term]);

  const handleSelectOperario = async (operario: Operario) => {
    setShowNoRegistroAlert(false);
    setSearchText('');
    setIsCheckingRegistro(true);
    try {
      const result = await getRegistroActivoOperario(operario.id);
      if (result.isSuccess) {
        const registro = extractRegistroActivo(result.value as unknown);
        if (registro?.idOperacion) {
          onSelectOperacion?.(registro.idOperacion);
          setIsDialogOpen(false);
          return;
        }
      }
      setShowNoRegistroAlert(true);
    } catch {
      setShowNoRegistroAlert(true);
    } finally {
      setIsCheckingRegistro(false);
    }
  };

  const handleMainAction = () => {
    if (selectedOperacionId) {
      onClearOperacion?.();
    } else {
      refetch();
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSearchText('');
    setShowNoRegistroAlert(false);
  };

  const selectorButton = (
    <Button
      fullWidth
      variant="outlined"
      className={`${styles['scope-project-button']} ${buttonOnly ? styles['scope-project-button-inline'] : ''} ${selectedOperacionId ? styles['scope-project-button-exit'] : ''}`}
      onClick={handleMainAction}
    >
      {selectedOperacionId ? <ClearRounded /> : <DensityMediumRounded />}
      <span className={styles['scope-project-label']}>
        {selectedOperacionId ? 'Salir del registro' : 'Seleccionar operación'}
      </span>
    </Button>
  );

  return (
    <>
      {buttonOnly ? selectorButton : (
        <Paper variant="outlined" className={styles['scope-card']}>
          <Typography variant="overline" color="text.secondary">Seleccionar operación</Typography>
          {selectorButton}
        </Paper>
      )}

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth={false}>
        <DialogTitle className={styles['scope-dialog-title']}>
          Seleccionar operación
          <IconButton onClick={handleCloseDialog} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers className={styles['scope-dialog-content']}>
          <Box sx={{ mb: 2 }}>
            <TextField
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setShowNoRegistroAlert(false); }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' || isCheckingRegistro || operariosEncontrados.length === 0) return;
                const exactMatch = operariosEncontrados.find(
                  (op) => op.nombre.trim().toLowerCase() === term || String(op.numeroOperario) === term,
                );
                const target = exactMatch ?? (operariosEncontrados.length === 1 ? operariosEncontrados[0] : null);
                if (!target) return;
                e.preventDefault();
                void handleSelectOperario(target);
              }}
              placeholder="Buscar operario por nombre o número..."
              fullWidth
              size="small"
              disabled={isCheckingRegistro}
              slotProps={{
                input: {
                  endAdornment: isCheckingRegistro ? <CircularProgress size={16} sx={{ mr: 0.5 }} /> : undefined,
                },
              }}
            />
            {term !== '' && !isCheckingRegistro && (
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mt: 0.5 }}>
                {operariosEncontrados.length > 0 ? (
                  <List dense disablePadding>
                    {operariosEncontrados.map((operario) => (
                      <ListItemButton key={operario.id} onClick={() => handleSelectOperario(operario)}>
                        <ListItemText
                          primary={`${operario.numeroOperario} - ${operario.nombre}`}
                          secondary={operario.rol}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 1.5 }}>
                    No se encontraron operarios.
                  </Typography>
                )}
              </Box>
            )}
            {showNoRegistroAlert && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                El operario seleccionado no tiene ningún registro de trabajo activo en este momento.
              </Alert>
            )}
          </Box>

          {isLoading ? (
            <Box className={styles['scope-dialog-state-wrap']}><CircularProgress size={20} /><Typography>Cargando artículos...</Typography></Box>
          ) : isError ? (
            <Typography color="error">Error al cargar el selector.</Typography>
          ) : (
            <Box className={styles['scope-tree-wrap']}>
              {articulosNoFinalizados.map(articulo => (
                <ArticuloAccordion
                  key={articulo.id}
                  articulo={articulo}
                  selectedOperacionId={selectedOperacionId}
                  onSelectOperacion={(id) => { onSelectOperacion?.(id); setIsDialogOpen(false); }}
                  queryClient={queryClient}
                />
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
