import React from 'react';
import { Box, List, ListItemButton, ListItemText, Typography, TextField } from '@mui/material';
import type { Operario } from '../../../../model/aggregates/Operarios';
import styles from './TeamManagementCard.module.css';

type Props = {
  searchText: string;
  setSearchText: (v: string) => void;
  canAddOperarios: boolean;
  isLoadingOperarios: boolean;
  allOperarios: Operario[];
  operariosActivos: Operario[];
  onAddOperario: (operario: Operario) => void;
};

export const TeamSearch = ({
  searchText,
  setSearchText,
  canAddOperarios,
  isLoadingOperarios,
  allOperarios,
  operariosActivos,
  onAddOperario,
}: Props) => {
  const term = searchText.trim().toLowerCase();

  const operariosEncontrados = React.useMemo(() => {
    if (!canAddOperarios || term === '') return [] as Operario[];

    return allOperarios.filter((operario) => {
      const isAlreadySelected = operariosActivos.some((selected) => selected.id === operario.id);
      if (isAlreadySelected) return false;

      const nombre = operario.nombre.toLowerCase();
      const numero = String(operario.numeroOperario);
      return nombre.includes(term) || numero.includes(term);
    });
  }, [allOperarios, canAddOperarios, operariosActivos, term]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;

    const exactMatch = operariosEncontrados.find((operario) => {
      const search = term;
      return (
        operario.nombre.trim().toLowerCase() === search ||
        String(operario.numeroOperario) === search
      );
    });

    if (!exactMatch) return;

    event.preventDefault();
    onAddOperario(exactMatch);
  };

  return (
    <Box className={styles['team-search-area']}>
      <TextField
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar operario..."
        fullWidth
        size="small"
        disabled={!canAddOperarios}
        className={styles['team-search-input']}
      />

      {searchText.trim() !== '' && canAddOperarios && (
        <Box className={styles['team-search-results-wrap']}>
          {isLoadingOperarios ? (
            <Box className={styles['team-loading-wrap']}>
              <Typography variant="body2" color="text.secondary">Buscando operarios...</Typography>
            </Box>
          ) : operariosEncontrados.length > 0 ? (
            <List dense disablePadding>
              {operariosEncontrados.map((operario) => (
                <ListItemButton key={operario.id} className={styles['team-search-item']} onClick={() => onAddOperario(operario)}>
                  <ListItemText primary={`${operario.numeroOperario} - ${operario.nombre}`} secondary={operario.rol} />
                </ListItemButton>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" className={styles['team-empty-search']}>No se encontraron operarios.</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TeamSearch;
