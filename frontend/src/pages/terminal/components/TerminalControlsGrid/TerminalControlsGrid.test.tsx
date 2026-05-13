import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TerminalControlsGrid } from './TerminalControlsGrid';

describe('Componente: TerminalControlsGrid', () => {
  const baseProps = {
    onStart: vi.fn(),
    onIncident: vi.fn(),
    onPause: vi.fn(),
    onNote: vi.fn(),
    onProduce: vi.fn(),
    onFinalizar: vi.fn(),
  };

  it('Debería renderizar los 5 botones por defecto', () => {
    render(<TerminalControlsGrid {...baseProps} />);

    expect(screen.getByText('Iniciar')).toBeInTheDocument();
    expect(screen.getByText('Incidencia')).toBeInTheDocument();
    expect(screen.getByText('Pausar')).toBeInTheDocument();
    expect(screen.getByText('Añadir Observaciones')).toBeInTheDocument();
    expect(screen.getByText('Marcar Produccion')).toBeInTheDocument();
  });

  it('Debería reemplazar "Iniciar" por "Finalizar" si showFinalizar es true', () => {
    render(<TerminalControlsGrid {...baseProps} showFinalizar={true} />);

    // Comprobamos que el botón Iniciar ya no existe
    expect(screen.queryByText('Iniciar')).toBeNull();
    // Y que ahora aparece el de Finalizar
    expect(screen.getByText('Finalizar')).toBeInTheDocument();
  });

  it('Debería llamar a la función correspondiente al hacer clic', async () => {
    const user = userEvent.setup();
    render(<TerminalControlsGrid {...baseProps} />);

    // Hacemos clic en "Pausar"
    const btnPausar = screen.getByText('Pausar');
    await user.click(btnPausar);

    expect(baseProps.onPause).toHaveBeenCalledOnce();
    // Nos aseguramos de que no llamó a ningún otro por error
    expect(baseProps.onStart).not.toHaveBeenCalled(); 
  });

  it('Debería deshabilitar un botón y cambiar su texto si está en modo Loading', () => {
    render(<TerminalControlsGrid {...baseProps} isProduceLoading={true} isProduceDisabled={true} />);

    // El texto original desaparece y muestra "Enviando..."
    expect(screen.queryByText('Marcar Produccion')).toBeNull();
    const btnCargando = screen.getByText('Enviando...');
    
    // Verificamos que el contenedor superior del botón tiene aria-disabled="true"
    // Buscamos su padre más cercano que tenga el rol "button"
    const paperContainer = btnCargando.closest('[role="button"]');
    expect(paperContainer).toHaveAttribute('aria-disabled', 'true');
  });

  // --- TESTS DE LÓGICA DE BLOQUEO (REGLAS DE NEGOCIO) ---

  it('Lógica de bloqueo: lockNonPauseActions debería bloquear todo excepto Pausar', async () => {
    const user = userEvent.setup();
    render(<TerminalControlsGrid {...baseProps} lockNonPauseActions={true} />);

    const btnIniciar = screen.getByText('Iniciar').closest('[role="button"]')!;
    const btnPausar = screen.getByText('Pausar').closest('[role="button"]')!;

    // Verificamos los atributos visuales
    expect(btnIniciar).toHaveAttribute('aria-disabled', 'true');
    expect(btnPausar).toHaveAttribute('aria-disabled', 'false');

    // Comprobamos que físicamente no se puede hacer clic en Iniciar
    await user.click(btnIniciar);
    expect(baseProps.onStart).not.toHaveBeenCalled();

    // Pero sí en Pausar
    await user.click(btnPausar);
    expect(baseProps.onPause).toHaveBeenCalled();
  });

  it('Lógica de bloqueo: allowIncidentWhenLocked debería permitir Incidencia incluso estando bloqueado', () => {
    render(
      <TerminalControlsGrid 
        {...baseProps} 
        lockNonPauseActions={true} 
        allowIncidentWhenLocked={true} 
      />
    );

    const btnIniciar = screen.getByText('Iniciar').closest('[role="button"]');
    const btnIncidencia = screen.getByText('Incidencia').closest('[role="button"]');
    const btnPausar = screen.getByText('Pausar').closest('[role="button"]');

    // Iniciar sigue bloqueado
    expect(btnIniciar).toHaveAttribute('aria-disabled', 'true');
    
    // PERO Pausar e Incidencia están desbloqueados
    expect(btnIncidencia).toHaveAttribute('aria-disabled', 'false');
    expect(btnPausar).toHaveAttribute('aria-disabled', 'false');
  });

  it('Lógica de bloqueo: isAllDisabled debería bloquear absolutamente todo', () => {
    render(
      <TerminalControlsGrid 
        {...baseProps} 
        isAllDisabled={true} 
        allowIncidentWhenLocked={true} // Incluso si esto es true, isAllDisabled gana
      />
    );

    const botones = screen.getAllByRole('button');
    
    // Verificamos que los 5 botones tengan aria-disabled="true"
    botones.forEach(boton => {
      expect(boton).toHaveAttribute('aria-disabled', 'true');
    });
  });
});