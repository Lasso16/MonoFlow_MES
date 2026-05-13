import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TerminalMainContent } from './TerminalMainContent';

import { OperationDataCard } from './OperationDataCard/OperationDataCard';
import { TeamManagementCard } from './TeamManagementCard/TeamManagementCard';

vi.mock('./OperationDataCard/OperationDataCard', () => ({
  OperationDataCard: vi.fn(({ operationSelectorControl }) => (
    <div data-testid="mock-operation-data-card">{operationSelectorControl}</div>
  )),
}));

vi.mock('./ProjectScopeCard/OperationSelectorCard', () => ({
  OperationSelectorCard: vi.fn(() => <div data-testid="mock-operation-selector" />),
}));

vi.mock('./TeamManagementCard/TeamManagementCard', () => ({
  TeamManagementCard: vi.fn(() => <div data-testid="mock-team-management" />),
}));

vi.mock('./TerminalControlsGrid/TerminalControlsGrid', () => ({
  TerminalControlsGrid: vi.fn(() => <div data-testid="mock-controls-grid" />),
}));

vi.mock('./TerminalHistoryTable/TerminalHistoryTable', () => ({
  TerminalHistoryTable: vi.fn(() => <div data-testid="mock-history-table" />),
}));

vi.mock('../../../components/errors/SectionErrorBoundary', () => ({
  SectionErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-error-boundary">{children}</div>
  ),
}));

describe('TerminalMainContent', () => {
  // Limpieza total antes de cada test para evitar el error "Number of calls: 3"
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const mockProps = {
    selectorProps: {
      selectedOperacionId: 'OP-123',
      onSelectOperacion: vi.fn(),
      onClearOperacion: vi.fn(),
      hasOperacionSeleccionada: true,
    },
    teamProps: {
      selectedOperarios: [],
      onSelectedOperariosChange: vi.fn(),
      isTeamLocked: false,
      hasProcesoIniciado: false,
      onTeamLockedChange: vi.fn(),
      onAllOperariosRemoved: vi.fn(),
    },
    operacionData: {
      operacion: { id: 'OP-123' },
      progreso: 50,
      registroActualOperacion: {},
      cliente: 'Cliente Test',
      descripcionArticulo: 'Articulo Test',
      operacionEstado: 'Iniciada',
    },
    controlsProps: {} as any,
    historyProps: {} as any,
  };

  it('debe pasar las props de "operacionData" correctamente al OperationDataCard', () => {
    render(<TerminalMainContent {...mockProps} />);

    expect(OperationDataCard).toHaveBeenCalledWith(
      expect.objectContaining({
        operacion: mockProps.operacionData.operacion,
        progreso: mockProps.operacionData.progreso,
        cliente: mockProps.operacionData.cliente,
      }),
      undefined 
    );
  });

  it('debe condicionar el permiso de añadir operarios basado en si hay operacion seleccionada', () => {
    const propsSinOp = {
      ...mockProps,
      selectorProps: { ...mockProps.selectorProps, hasOperacionSeleccionada: false }
    };
    
    render(<TerminalMainContent {...propsSinOp} />);

    expect(TeamManagementCard).toHaveBeenLastCalledWith(
      expect.objectContaining({
        canAddOperarios: false
      }),
      undefined
    );
  });
});