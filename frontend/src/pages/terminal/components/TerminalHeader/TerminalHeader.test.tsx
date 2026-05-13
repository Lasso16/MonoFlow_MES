import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TerminalHeader } from './TerminalHeader';

describe('Componente: TerminalHeader', () => {
  it('Debería renderizar el título de la aplicación', () => {
    render(<TerminalHeader />);

    const titulo = screen.getByText('MonoFlow');
    expect(titulo).toBeInTheDocument();
  });

  it('Debería tener la semántica HTML correcta (Heading h6)', () => {
    render(<TerminalHeader />);

    const encabezado = screen.getByRole('heading', { name: 'MonoFlow', level: 6 });
    expect(encabezado).toBeInTheDocument();
  });
});