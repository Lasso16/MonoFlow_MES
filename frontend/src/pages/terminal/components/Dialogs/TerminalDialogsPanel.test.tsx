import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TerminalDialogsPanel } from './TerminalDialogsPanel';

// 1. Mocks corregidos: Intentamos con la ruta exacta del archivo si '../RegistroErrorSnackbar' no funciona.
// A veces, si el componente está en '../RegistroErrorSnackbar/RegistroErrorSnackbar.tsx', 
// Vitest necesita la ruta completa para emparejar el import.

vi.mock('../RegistroErrorSnackbar/RegistroErrorSnackbar', () => ({
  RegistroErrorSnackbar: vi.fn(({ message }: any) => 
    message ? <div data-testid="mock-snackbar">{message}</div> : null
  )
}));

vi.mock('./IncidenciaDialog', () => ({
  IncidenciaDialog: vi.fn(({ open }: any) => open ? <div data-testid="mock-incidencia" /> : null)
}));

vi.mock('./PauseReasonDialog', () => ({
  PauseReasonDialog: vi.fn(({ open }: any) => open ? <div data-testid="mock-pause" /> : null)
}));

vi.mock('./ProduccionDialog', () => ({
  ProduccionDialog: vi.fn(({ open }: any) => open ? <div data-testid="mock-produccion" /> : null)
}));

vi.mock('../ObservacionDialog/ObservacionDialog', () => ({
  ObservacionDialog: vi.fn(({ open }: any) => open ? <div data-testid="mock-observacion" /> : null)
}));

describe('Componente: TerminalDialogsPanel', () => {
  
  const defaultProps: any = {
    snackbarProps: { message: 'Hay un error', onClose: vi.fn() },
    pauseDialogProps: { open: true },
    observacionDialogProps: { open: true },
    incidenciaDialogProps: { open: true },
    produccionDialogProps: { open: true },
  };

  it('Debería renderizar todos los diálogos cuando sus props de activación están presentes', () => {
    render(<TerminalDialogsPanel {...defaultProps} />);

    // Verificamos que el mock se está usando realmente (debería ser un div simple, no el MuiSnackbar real)
    expect(screen.getByTestId('mock-snackbar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-pause')).toBeInTheDocument();
    expect(screen.getByTestId('mock-observacion')).toBeInTheDocument();
    expect(screen.getByTestId('mock-incidencia')).toBeInTheDocument();
    expect(screen.getByTestId('mock-produccion')).toBeInTheDocument();
  });

  it('No debería renderizar la snackbar si el mensaje es null', () => {
    const propsSinError = {
      ...defaultProps,
      snackbarProps: { message: null, onClose: vi.fn() },
    };

    render(<TerminalDialogsPanel {...propsSinError} />);

    expect(screen.queryByTestId('mock-snackbar')).toBeNull();
  });
});