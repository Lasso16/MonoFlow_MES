import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { TerminalHistoryTable } from './TerminalHistoryTable';
import { useTerminalHistoryData } from '../../hooks/useTerminalHistoryData';

vi.mock('../../hooks/useTerminalHistoryData', () => ({
  useTerminalHistoryData: vi.fn(),
}));

describe('Componente: TerminalHistoryTable', () => {
  const mockHook = vi.mocked(useTerminalHistoryData);

  beforeEach(() => {
    vi.clearAllMocks();
    mockHook.mockReturnValue({
      eventosVisibles: [],
      hasMultipleEvents: false,
      totalEventos: 0,
    });
  });


  it('Debería mostrar el estado de "Cargando"', () => {
    render(<TerminalHistoryTable isRegistroActualOperacionLoading={true} />);
    expect(screen.getByText('Cargando registro de eventos...')).toBeInTheDocument();
  });

  it('Debería mostrar el estado de "Error"', () => {
    render(<TerminalHistoryTable isRegistroActualOperacionError={true} />);
    expect(screen.getByText('No hay registro de trabajo activo para esta operacion.')).toBeInTheDocument();
  });

  it('Debería pedir que se seleccione una operación si no hay operacionId', () => {
    render(<TerminalHistoryTable operacionId={undefined} />);
    expect(screen.getByText('Selecciona una operacion para ver su registro de eventos.')).toBeInTheDocument();
  });

  it('Debería avisar si el registro actual no tiene eventos todavía', () => {
    render(<TerminalHistoryTable operacionId="OP-123" />);
    expect(screen.getByText('El registro actual no tiene eventos todavia.')).toBeInTheDocument();
  });



  it('Debería renderizar la lista de eventos cuando hay datos', () => {
    mockHook.mockReturnValue({
      eventosVisibles: [
        {
          id: '1',
          tipoEvento: 'Inicio Produccion',
          inicio: '2023-01-01T10:00:00Z',
          inicioMs: 1000,
          color: 'enejecucion',
          isIncidencia: false,
          sortTime: 1000,
          fin: '2023-01-01T11:00:00Z',
          duracionMs: 3600000, 
        }
      ],
      hasMultipleEvents: false,
      totalEventos: 1,
    });

    render(<TerminalHistoryTable operacionId="OP-123" />);

    expect(screen.getByText('Inicio Produccion')).toBeInTheDocument();
    
    expect(screen.getByText('01:00:00')).toBeInTheDocument();
  });

  it('Debería alternar el texto del botón de historial al hacer clic', async () => {
    const user = userEvent.setup();
    
    mockHook.mockReturnValue({
      eventosVisibles: [
        { id: '1', tipoEvento: 'Ev1', color: 'pendiente', isIncidencia: false, sortTime: 1 }
      ] as any,
      hasMultipleEvents: true,
      totalEventos: 5,
    });

    render(<TerminalHistoryTable operacionId="OP-123" />);

    const botonHistorial = screen.getByText('Ver todo el historial de eventos');
    expect(botonHistorial).toBeInTheDocument();

    await user.click(botonHistorial);

    expect(screen.getByText('Ocultar historial de eventos')).toBeInTheDocument();
    
    expect(screen.queryByText('Ver todo el historial de eventos')).toBeNull();
  });
});