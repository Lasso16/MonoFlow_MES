import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminOperacionDialog } from './AdminOperacionDialog';

vi.mock('../../hooks/useAdminOperacionData', () => ({
  useAdminOperacionData: vi.fn(),
}));

vi.mock('../../../../hooks/queries/useRegistroTrabajoQueries', () => ({
  useRegistroTrabajoMutations: () => ({
    finalizarRegistroTrabajoMutation: {
      isPending: false,
      mutate: vi.fn(),
    },
  }),
}));

import { useAdminOperacionData } from '../../hooks/useAdminOperacionData';

const emptyData = {
  registroActual: undefined,
  resumenOperacion: undefined,
  sesionesActivas: [],
  resumenRoot: undefined,
  historialRegistros: [],
  rechazosRegistroActual: [],
  incidenciasParosRegistroActual: [],
  isRegistroActualLoading: false,
  isRegistroActualFetching: false,
  isResumenLoading: false,
};

describe('Componente: AdminOperacionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAdminOperacionData).mockReturnValue(emptyData as any);
  });

  it('No renderiza cuando operacionId=null', () => {
    render(
      <AdminOperacionDialog operacionId={null} operacionTipo="" onClose={vi.fn()} />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Muestra el título con el tipo de operación', () => {
    render(
      <AdminOperacionDialog operacionId="OP-1" operacionTipo="Montaje" onClose={vi.fn()} />,
    );

    expect(screen.getByText(/Detalle de Operación - Montaje/)).toBeInTheDocument();
  });

  it('Título sin tipo cuando operacionTipo está vacío', () => {
    render(
      <AdminOperacionDialog operacionId="OP-1" operacionTipo="" onClose={vi.fn()} />,
    );

    expect(screen.getByText('Detalle de Operación')).toBeInTheDocument();
  });

  it('Muestra ambas pestañas', () => {
    render(
      <AdminOperacionDialog operacionId="OP-1" operacionTipo="Montaje" onClose={vi.fn()} />,
    );

    expect(screen.getByRole('tab', { name: 'Registro Actual' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Historial' })).toBeInTheDocument();
  });

  it('Tab activo por defecto es Registro Actual', () => {
    render(
      <AdminOperacionDialog operacionId="OP-1" operacionTipo="Montaje" onClose={vi.fn()} />,
    );

    expect(screen.getByText('No hay registro abierto actualmente.')).toBeInTheDocument();
  });

  it('Cambiar a pestaña Historial muestra TabHistorial', async () => {
    const user = userEvent.setup();
    render(
      <AdminOperacionDialog operacionId="OP-1" operacionTipo="Montaje" onClose={vi.fn()} />,
    );

    await user.click(screen.getByRole('tab', { name: 'Historial' }));

    expect(screen.getByText('No hay historial disponible.')).toBeInTheDocument();
  });

  it('Botón Cerrar llama onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <AdminOperacionDialog operacionId="OP-1" operacionTipo="Montaje" onClose={onClose} />,
    );

    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('Pasa el operacionId al hook useAdminOperacionData', () => {
    render(
      <AdminOperacionDialog operacionId="OP-42" operacionTipo="Ensamblaje" onClose={vi.fn()} />,
    );

    expect(vi.mocked(useAdminOperacionData)).toHaveBeenCalledWith('OP-42');
  });
});
