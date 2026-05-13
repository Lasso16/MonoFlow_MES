import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTerminalDialogsState } from './useTerminalDialogsState';

describe('Hook: useTerminalDialogsState', () => {

  it('Debería inicializar todas las variables con sus valores por defecto', () => {
    const { result } = renderHook(() => useTerminalDialogsState('OP-1'));

    expect(result.current.isObservacionDialogOpen).toBe(false);
    expect(result.current.observacionText).toBe('');
    
    expect(result.current.isProduccionDialogOpen).toBe(false);
    expect(result.current.piezasBuenasText).toBe('');
    expect(result.current.piezasRechazadasText).toBe('');
    expect(result.current.selectedRechazoId).toBe('');
    expect(result.current.rechazoComentario).toBe('');
  });

  it('Debería permitir modificar los estados mediante sus setters', () => {
    const { result } = renderHook(() => useTerminalDialogsState('OP-1'));

    act(() => {
      result.current.setIsObservacionDialogOpen(true);
      result.current.setObservacionText('Falta luz en la estación');
      
      result.current.setIsProduccionDialogOpen(true);
      result.current.setPiezasBuenasText('100');
      result.current.setPiezasRechazadasText('5');
      result.current.setSelectedRechazoId('3');
      result.current.setRechazoComentario('Pieza rayada');
    });

    expect(result.current.isObservacionDialogOpen).toBe(true);
    expect(result.current.observacionText).toBe('Falta luz en la estación');
    expect(result.current.isProduccionDialogOpen).toBe(true);
    expect(result.current.piezasBuenasText).toBe('100');
    expect(result.current.piezasRechazadasText).toBe('5');
    expect(result.current.selectedRechazoId).toBe('3');
    expect(result.current.rechazoComentario).toBe('Pieza rayada');
  });

  it('Debería resetear todos los estados si cambia el operacionId', () => {
    const { result, rerender } = renderHook(
      ({ id }) => useTerminalDialogsState(id),
      { initialProps: { id: 'OP-1' } }
    );

    act(() => {
      result.current.setIsProduccionDialogOpen(true);
      result.current.setPiezasBuenasText('50');
      result.current.setObservacionText('Comentario a medias...');
    });

    expect(result.current.isProduccionDialogOpen).toBe(true);
    expect(result.current.piezasBuenasText).toBe('50');

    act(() => {
      rerender({ id: 'OP-2' });
    });

    expect(result.current.isProduccionDialogOpen).toBe(false);
    expect(result.current.piezasBuenasText).toBe('');
    expect(result.current.observacionText).toBe('');
  });

});