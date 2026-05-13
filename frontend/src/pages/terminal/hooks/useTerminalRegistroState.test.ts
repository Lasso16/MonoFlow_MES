import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTerminalRegistroState } from './useTerminalRegistroState';

describe('Hook: useTerminalRegistroState', () => {

  it('Debería devolver valores por defecto si no hay registro activo (null)', () => {
    const { result } = renderHook(() => 
      useTerminalRegistroState({
        registroActualOperacion: null,
        selectedOperarioIdsCount: 2,
      })
    );

    expect(result.current.hasRegistroActivo).toBe(false);
    expect(result.current.equipoCount).toBe(2);
    expect(result.current.nextEventoTipo).toBe(null);
    expect(result.current.startActionLabel).toBe('Iniciar preparación');
  });

  it('Debería detectar el número de operarios basándose en las sesiones activas (prioridad sobre seleccionados)', () => {
    const { result } = renderHook(() => 
      useTerminalRegistroState({
        registroActualOperacion: {
          sesionesActivas: [{ id: 1 }, { id: 2 }, { id: 3 }] as any,
          finalizado: false
        } as any,
        selectedOperarioIdsCount: 1,
      })
    );

    expect(result.current.equipoCount).toBe(3);
    expect(result.current.hasRegistroActivo).toBe(true);
  });

  it('Debería calcular que el siguiente evento es Ejecución (2) si ya hay Preparación (1)', () => {
    const { result } = renderHook(() => 
      useTerminalRegistroState({
        registroActualOperacion: {
          finalizado: false,
          eventos: [
            { idTipoEvento: 1, inicio: '2023-01-01T10:00:00', fin: '2023-01-01T10:15:00' }
          ]
        } as any,
        selectedOperarioIdsCount: 1,
      })
    );

    expect(result.current.currentEventType).toBe(1);
    expect(result.current.nextEventoTipo).toBe(2);
    expect(result.current.startActionLabel).toBe('Ejecucion');
  });

  it('Debería calcular que el siguiente evento es Recogida (5) si ya hay Ejecución (2)', () => {
    const { result } = renderHook(() => 
      useTerminalRegistroState({
        registroActualOperacion: {
          finalizado: false,
          eventos: [
            { idTipoEvento: 1, inicio: '2023-01-01T10:00:00', fin: '2023-01-01T10:15:00' },
            { idTipoEvento: 2, inicio: '2023-01-01T10:15:00', fin: '2023-01-01T12:00:00' }
          ]
        } as any,
        selectedOperarioIdsCount: 1,
      })
    );

    expect(result.current.currentEventType).toBe(2);
    expect(result.current.nextEventoTipo).toBe(5);
    expect(result.current.startActionLabel).toBe('Recogida');
  });

  it('Debería detectar el estado como finalizado si ya tiene evento de Recogida (5)', () => {
    const { result } = renderHook(() => 
      useTerminalRegistroState({
        registroActualOperacion: {
          finalizado: false,
          eventos: [
            { idTipoEvento: 5, inicio: '2023-01-01T12:00:00' }
          ]
        } as any,
        selectedOperarioIdsCount: 1,
      })
    );

    expect(result.current.hasRecogida).toBe(true);
    expect(result.current.nextEventoTipo).toBe(null);
    expect(result.current.startActionLabel).toBe('Proceso completo');
  });

  it('Debería leer correctamente las propiedades en mayúsculas (PascalCase) enviadas por .NET', () => {
    const { result } = renderHook(() => 
      useTerminalRegistroState({
        registroActualOperacion: {
          Finalizado: false,
          Eventos: [
            { IdTipoEvento: 2, Inicio: '2023-01-01T10:15:00' }
          ],
          SesionesActivas: [{ id: 1 }, { id: 2 }]
        } as any,
        selectedOperarioIdsCount: 0,
      })
    );

    expect(result.current.hasRegistroActivo).toBe(true);
    expect(result.current.equipoCount).toBe(2);
    expect(result.current.nextEventoTipo).toBe(5); 
    expect(result.current.currentEventType).toBe(2); 
  });
});