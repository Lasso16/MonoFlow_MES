import { memo, useMemo, useState } from "react";
import {
  Box,
  List,
  Paper,
  Switch,
  Typography,
} from "@mui/material";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import type { Operario } from "../../../../model/aggregates/Operarios";
import { useGetOperarios } from "../../../../hooks/queries/useOperariosQueries";
import {
  useGetRegistroActualOperacion,
  useRegistroTrabajoMutations,
} from "../../../../hooks/queries/useRegistroTrabajoQueries";

// (Requiere confirmación now handled by isLocked; utility import removed)
import styles from "./TeamManagementCard.module.css";
import { SelectedOperarioItem } from "./SelectedOperarioItem";
import { TeamDialogs } from "./TeamDialog";
import TeamSearch from './TeamSearch';
import { computeOperariosActivos } from './TeamManagement.utils';

export type TeamManagementCardProps = {
  operacionId?: string;
  operacionEstado?: string | number;
  selectedOperarios: Operario[];
  onSelectedOperariosChange: (operarios: Operario[]) => void;
  isLocked: boolean;
  hasProcesoIniciado?: boolean;
  onLockedChange: (locked: boolean) => void;
  canAddOperarios?: boolean;
  onAllOperariosRemoved?: () => void;
};

export const TeamManagementCard = memo(
  ({
    operacionId,
    selectedOperarios,
    onSelectedOperariosChange,
    isLocked,
    hasProcesoIniciado = false,
    onLockedChange,
    canAddOperarios = true,
    onAllOperariosRemoved: _onAllOperariosRemoved,
  }: TeamManagementCardProps) => {
    const [searchText, setSearchText] = useState("");
    const [operarioToRemove, setOperarioToRemove] = useState<Operario | null>(
      null,
    );
    const [operarioToAdd, setOperarioToAdd] = useState<Operario | null>(null);
    const [hiddenOperarioIds, setHiddenOperarioIds] = useState<string[]>([]);

    const { cerrarSesionOperarioMutation, abrirRegistroTrabajoMutation } =
      useRegistroTrabajoMutations();
    const { data: registroActual } = useGetRegistroActualOperacion(operacionId);

    const { data: allOperarios = [], isLoading: isLoadingOperarios } = useGetOperarios({ activo: true });

    const operariosActivos = useMemo(
      () => computeOperariosActivos(registroActual?.operarios, selectedOperarios, hiddenOperarioIds),
      [registroActual, selectedOperarios, hiddenOperarioIds],
    );

    const handleConfirmRemove = () => {
      if (!operarioToRemove) return;
      const id = operarioToRemove.id;
      setHiddenOperarioIds((prev) => [...prev, id]);
      onSelectedOperariosChange(selectedOperarios.filter((op) => op.id !== id));

      // NO ejecutar onAllOperariosRemoved aquí - dejar que useTerminalAccionesFlow lo maneje
      // para evitar interferencia con la lógica de eliminación manual en TeamManagementCard

      cerrarSesionOperarioMutation.mutate(id);
      setOperarioToRemove(null);
    };

    const handleAddOperario = (operario: Operario) => {
      if (!canAddOperarios || isLocked) return;

      if (hasProcesoIniciado) {
        setOperarioToAdd(operario);
      } else {
        onSelectedOperariosChange([...selectedOperarios, operario]);
        setHiddenOperarioIds((prev) => prev.filter((id) => id !== operario.id));
        setSearchText("");
      }
    };

    // search key handling moved into TeamSearch

    return (
      <>
        <Paper variant="outlined" className={styles["team-card"]}>
          <Box className={styles["team-card-header"]}>
            <Box>
              <Typography
                variant="overline"
                className={styles["team-card-title"]}
              >
                Gestión de Equipo
              </Typography>
            </Box>
            <Box className={styles["team-lock-control"]}>
              {isLocked ? (
                <LockOutlinedIcon fontSize="small" />
              ) : (
                <LockOpenOutlinedIcon fontSize="small" />
              )}
              <Switch
                size="small"
                checked={isLocked}
                onChange={(_, checked) => onLockedChange(checked)}
                slotProps={{
                  input: {
                    "aria-label": isLocked
                      ? "Desbloquear gestion de equipo"
                      : "Bloquear gestion de equipo",
                  },
                }}
              />
            </Box>
          </Box>

          <Box className={styles["team-content-wrap"]}>
            <TeamSearch
              searchText={searchText}
              setSearchText={setSearchText}
              canAddOperarios={canAddOperarios && !isLocked}
              isLoadingOperarios={isLoadingOperarios}
              allOperarios={allOperarios}
              operariosActivos={operariosActivos}
              onAddOperario={handleAddOperario}
            />

            <Box className={styles["team-chip-list-scroll"]}>
              <List dense>
                {operariosActivos.map((op) => (
                  <SelectedOperarioItem
                    key={op.id}
                    operario={op}
                    onRequestRemove={setOperarioToRemove}
                    disabled={isLocked}
                  />
                ))}
              </List>
            </Box>
          </Box>
        </Paper>

        <TeamDialogs
          operarioToRemove={operarioToRemove}
          operarioToAdd={operarioToAdd}
          isAddingPending={abrirRegistroTrabajoMutation.isPending}
          onCancelRemove={() => setOperarioToRemove(null)}
          onConfirmRemove={handleConfirmRemove}
          onCancelAdd={() => setOperarioToAdd(null)}
          onConfirmAdd={() => {
            if (!operarioToAdd) return;
            
            const newOperarios = [...selectedOperarios, operarioToAdd];
            onSelectedOperariosChange(newOperarios);
            
            // Limpiar de hiddenOperarioIds si estaba oculto
            setHiddenOperarioIds((prev) => prev.filter((id) => id !== operarioToAdd.id));
            
            // Con proceso iniciado, el alta requiere abrir sesión del operario.
            if (hasProcesoIniciado && operacionId) {
              abrirRegistroTrabajoMutation.mutate(
                {
                  operacionId,
                  payload: { idOperarios: [operarioToAdd.id] },
                },
                {
                  onError: () => {
                    // Remove the operario if the mutation fails
                    onSelectedOperariosChange(selectedOperarios);
                  },
                }
              );
            }
            
            setOperarioToAdd(null);
            setSearchText("");
          }}
        />
      </>
    );
  },
);