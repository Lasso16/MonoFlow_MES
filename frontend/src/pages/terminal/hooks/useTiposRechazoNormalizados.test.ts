import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTiposRechazoNormalizados } from './useTiposRechazoNormalizados';
import type { TipoRechazo } from '../../../model/aggregates/Maestros';

describe('Hook: useTiposRechazoNormalizados', () => {

  it('Debería devolver un array vacío si recibe un array vacío', () => {
    const { result } = renderHook(() => useTiposRechazoNormalizados([]));
    expect(result.current).toEqual([]);
  });

  it('Debería mapear correctamente datos bien formateados (minúsculas)', () => {
    const datosSucios = [
      { id: 1, tipo: 'Defecto visual', motivo: 'Arañazo' }
    ] as TipoRechazo[];

    const { result } = renderHook(() => useTiposRechazoNormalizados(datosSucios));

    expect(result.current).toEqual([
      { id: 1, tipo: 'Defecto visual', motivo: 'Arañazo' }
    ]);
  });

  it('Debería normalizar datos que vienen con mayúsculas al estilo C# (.NET)', () => {
    const datosPuntoNet = [
      { Id: 2, Tipo: 'Rotura', Motivo: 'Golpe' }
    ] as any;
    const { result } = renderHook(() => useTiposRechazoNormalizados(datosPuntoNet));

    expect(result.current).toEqual([
      { id: 2, tipo: 'Rotura', motivo: 'Golpe' }
    ]);
  });

  it('Debería descartar los elementos que no tienen un ID numérico válido', () => {
    const datosInvalidos = [
      { id: 1, tipo: 'Ok' },
      { id: null, tipo: 'Sin ID' },
      { Id: 'tres', tipo: 'String ID' },
      { tipo: 'Invisible' }
    ] as any;

    const { result } = renderHook(() => useTiposRechazoNormalizados(datosInvalidos));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe(1);
  });

  it('Debería aplicar el valor por defecto si falta el tipo y el motivo', () => {
    const datosSinTipo = [
      { id: 5, tipo: '   ', Motivo: '' }
    ] as any;

    const { result } = renderHook(() => useTiposRechazoNormalizados(datosSinTipo));

    expect(result.current[0].tipo).toBe('Motivo de rechazo');
  });

  it('Debería usar el "motivo" como "tipo" si el "tipo" viene vacío', () => {
    const datosCruzados = [
      { id: 6, motivo: 'Fallo eléctrico' }
    ] as any;

    const { result } = renderHook(() => useTiposRechazoNormalizados(datosCruzados));

    expect(result.current[0].tipo).toBe('Fallo eléctrico');
  });

});