import { Box, Container } from "@mui/material";
import { OperationDataCard } from "./OperationDataCard/OperationDataCard";
import { OperationSelectorCard } from "./ProjectScopeCard/OperationSelectorCard";
import { TeamManagementCard } from "./TeamManagementCard/TeamManagementCard";
import { TerminalControlsGrid } from "./TerminalControlsGrid/TerminalControlsGrid";
import { TerminalHistoryTable } from "./TerminalHistoryTable/TerminalHistoryTable";
import type { Operario } from "../../../model/aggregates/Operarios";
import { SectionErrorBoundary } from "../../../components/errors/SectionErrorBoundary";

type TerminalMainContentProps = {
  // 🔥 Los 5 paquetes de datos
  selectorProps: {
    selectedOperacionId?: string;
    onSelectOperacion: (operacionId: string) => void;
    onClearOperacion: () => void;
    hasOperacionSeleccionada: boolean;
  };
  teamProps: {
    selectedOperarios: Operario[];
    onSelectedOperariosChange: (operarios: Operario[]) => void;
    isTeamLocked: boolean;
    hasProcesoIniciado: boolean;
    onTeamLockedChange: (locked: boolean) => void;
    onAllOperariosRemoved?: () => void;
  };
  operacionData: {
    operacion: any;
    progreso: any;
    registroActualOperacion: any;
    cliente: any;
    descripcionArticulo: any;
    operacionEstado: any;
  };
  controlsProps: React.ComponentProps<typeof TerminalControlsGrid>;
  historyProps: React.ComponentProps<typeof TerminalHistoryTable>;
};

export const TerminalMainContent = ({
  selectorProps,
  teamProps,
  operacionData,
  controlsProps,
  historyProps,
}: TerminalMainContentProps) => {
  return (
    <Box sx={{ minHeight: 'calc(100vh - 72px)', width: 1, py: 4, bgcolor: 'grey.50' }}>
      <Container
        maxWidth={false}
        sx={{
          px: { xs: '16px !important', sm: '1rem !important', xl: '48px !important' },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 2fr) minmax(300px, 1fr)' },
            gap: 2,
            mb: 2,
            minHeight: 'fit-content',
            alignItems: { xl: 'stretch' },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <SectionErrorBoundary sectionName="Datos de Operación">
              <OperationDataCard
                operacion={operacionData.operacion}
                progreso={operacionData.progreso}
                registroActualOperacion={operacionData.registroActualOperacion}
                cliente={operacionData.cliente}
                descripcionArticulo={operacionData.descripcionArticulo}
                operationSelectorControl={
                  <OperationSelectorCard
                    buttonOnly
                    selectedOperacionId={selectorProps.selectedOperacionId}
                    onSelectOperacion={selectorProps.onSelectOperacion}
                    onClearOperacion={selectorProps.onClearOperacion}
                  />
                }
              />
            </SectionErrorBoundary>
          </Box>
          <Box sx={{ minWidth: 0, alignSelf: 'start' }}>
            <SectionErrorBoundary sectionName="Gestión de Equipo">
              <TeamManagementCard
                operacionId={selectorProps.selectedOperacionId}
                operacionEstado={operacionData.operacionEstado}
                selectedOperarios={teamProps.selectedOperarios}
                onSelectedOperariosChange={teamProps.onSelectedOperariosChange}
                isLocked={teamProps.isTeamLocked}
                hasProcesoIniciado={teamProps.hasProcesoIniciado}
                onLockedChange={teamProps.onTeamLockedChange}
                canAddOperarios={selectorProps.hasOperacionSeleccionada}
                onAllOperariosRemoved={teamProps.onAllOperariosRemoved}
              />
            </SectionErrorBoundary>
          </Box>
        </Box>

        <TerminalControlsGrid {...controlsProps} />

        <Box sx={{ mt: 2 }}>
          <SectionErrorBoundary sectionName="Historial">
            <TerminalHistoryTable {...historyProps} />
          </SectionErrorBoundary>
        </Box>
      </Container>
    </Box>
  );
};
