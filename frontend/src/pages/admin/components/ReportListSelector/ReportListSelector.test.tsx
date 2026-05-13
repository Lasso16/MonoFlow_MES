import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ReportListSelector } from './ReportListSelector';

describe('Componente: ReportListSelector', () => {
  it('No renderiza nada cuando items=[]', () => {
    const { container } = render(
      <ReportListSelector items={[]} onSelect={vi.fn()} title="Órdenes" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('Muestra spinner cuando loading=true', () => {
    render(
      <ReportListSelector items={[]} onSelect={vi.fn()} title="Órdenes" loading={true} />,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('Muestra el título y los items como botones', () => {
    const items = [
      { id: '1', idNavision: 'NAV-001', descripcion: 'Desc 1', cliente: 'Cliente A' },
      { id: '2', idNavision: 'NAV-002', descripcion: 'Desc 2', cliente: '' },
    ];
    render(<ReportListSelector items={items} onSelect={vi.fn()} title="Órdenes" />);

    expect(screen.getByText('Órdenes')).toBeInTheDocument();
    expect(screen.getByText('Navision: NAV-001')).toBeInTheDocument();
    expect(screen.getByText('Navision: NAV-002')).toBeInTheDocument();
  });

  it('Formato operación: muestra tipoOperacion como texto primario', () => {
    const items = [
      { id: 'OP-1', tipoOperacion: 'Montaje', articuloDescripcion: 'Mesa', cantidadTotal: 10 },
    ];
    render(
      <ReportListSelector items={items} onSelect={vi.fn()} title="Operaciones" isOperation />,
    );

    expect(screen.getByText('Montaje')).toBeInTheDocument();
    expect(screen.getByText(/Artículo: Mesa/)).toBeInTheDocument();
  });

  it('Clic en item llama onSelect con el item', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const items = [{ id: '1', idNavision: 'NAV-001', descripcion: 'Desc', cliente: 'X' }];
    render(<ReportListSelector items={items} onSelect={onSelect} title="Órdenes" />);

    await user.click(screen.getByText('Navision: NAV-001'));

    expect(onSelect).toHaveBeenCalledWith(items[0]);
  });

  it('Item seleccionado tiene clase Mui-selected', () => {
    const items = [
      { id: '1', idNavision: 'NAV-001', descripcion: 'D1', cliente: '' },
      { id: '2', idNavision: 'NAV-002', descripcion: 'D2', cliente: '' },
    ];
    render(
      <ReportListSelector items={items} selectedId="1" onSelect={vi.fn()} title="Órdenes" />,
    );

    const buttons = screen.getAllByRole('button');
    const selectedButtons = buttons.filter((b) => b.classList.contains('Mui-selected'));
    expect(selectedButtons).toHaveLength(1);
    expect(selectedButtons[0]).toHaveTextContent('Navision: NAV-001');
  });

  it('articuloDescripcion undefined muestra guion en formato operación', () => {
    const items = [{ id: 'OP-1', tipoOperacion: 'Ensamblaje', cantidadTotal: 5 }];
    render(
      <ReportListSelector items={items} onSelect={vi.fn()} title="Ops" isOperation />,
    );

    expect(screen.getByText(/Artículo: —/)).toBeInTheDocument();
  });
});
