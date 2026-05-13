import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdminOperacionData } from './useAdminOperacionData';

vi.mock('../../../hooks/queries/useRegistroTrabajoQueries', () => ({
  useGetRegistroActualOperacion: vi.fn(),
}));

vi.mock('../../../hooks/queries/useOperacionesQueries', () => ({
  useGetOperacionResumen: vi.fn(),
}));

import { useGetRegistroActualOperacion } from '../../../hooks/queries/useRegistroTrabajoQueries';
import { useGetOperacionResumen } from '../../../hooks/queries/useOperacionesQueries';

describe('Hook: useAdminOperacionData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetRegistroActualOperacion).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
    } as any);
    vi.mocked(useGetOperacionResumen).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);
  });

  it('Sin datos: devuelve arrays vacíos y loading en false', () => {
    const { result } = renderHook(() => useAdminOperacionData('OP-1'));

    expect(result.current.sesionesActivas).toEqual([]);
    expect(result.current.historialRegistros).toEqual([]);
    expect(result.current.rechazosRegistroActual).toEqual([]);
    expect(result.current.incidenciasParosRegistroActual).toEqual([]);
    expect(result.current.isRegistroActualLoading).toBe(false);
    expect(result.current.isResumenLoading).toBe(false);
  });

  it('sesionesActivas extrae del campo sesionesActivas de registroActual', () => {
    const sesiones = [{ operarioId: 'OP-1', nombre: 'Juan', inicio: '2026-01-01T08:00:00Z', fin: null }];
    vi.mocked(useGetRegistroActualOperacion).mockReturnValue({
      data: { sesionesActivas: sesiones, inicio: '2026-01-01T08:00:00Z' },
      isLoading: false,
      isFetching: false,
    } as any);

    const { result } = renderHook(() => useAdminOperacionData('OP-1'));

    expect(result.current.sesionesActivas).toEqual([
      {
        id: 'OP-1',
        operarioId: 'OP-1',
        numeroOperario: '',
        nombre: 'Juan',
        inicio: '2026-01-01T08:00:00Z',
        fin: null,
      },
    ]);
  });

  it('sesionesActivas extrae del campo alternativo SesionesActivas (case insensitive)', () => {
    const sesiones = [{ operarioId: 'OP-2', nombre: 'Ana', inicio: '2026-01-01T08:00:00Z', fin: null }];
    vi.mocked(useGetRegistroActualOperacion).mockReturnValue({
      data: { SesionesActivas: sesiones, inicio: '2026-01-01T08:00:00Z' },
      isLoading: false,
      isFetching: false,
    } as any);

    const { result } = renderHook(() => useAdminOperacionData('OP-1'));

    expect(result.current.sesionesActivas).toEqual([
      {
        id: 'OP-2',
        operarioId: 'OP-2',
        numeroOperario: '',
        nombre: 'Ana',
        inicio: '2026-01-01T08:00:00Z',
        fin: null,
      },
    ]);
  });

  it('historialRegistros extrae y ordena por fecha descendente', () => {
    const registros = [
      { inicio: '2026-01-03T10:00:00Z' },
      { inicio: '2026-01-01T10:00:00Z' },
      { inicio: '2026-01-02T10:00:00Z' },
    ];
    vi.mocked(useGetOperacionResumen).mockReturnValue({
      data: { detalleRegistros: registros },
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useAdminOperacionData('OP-1'));

    const fechas = result.current.historialRegistros.map((r: any) => r.inicio);
    expect(fechas[0]).toBe('2026-01-03T10:00:00Z');
    expect(fechas[1]).toBe('2026-01-02T10:00:00Z');
    expect(fechas[2]).toBe('2026-01-01T10:00:00Z');
  });

  it('resumenRoot desenvuelve wrapper value si existe', () => {
    const registros = [{ inicio: '2026-01-01T10:00:00Z' }];
    vi.mocked(useGetOperacionResumen).mockReturnValue({
      data: { value: { detalleRegistros: registros } },
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useAdminOperacionData('OP-1'));

    expect(result.current.historialRegistros).toHaveLength(1);
  });

  it('rechazosRegistroActual usa rechazos del registro si existen', () => {
    const rechazos = [{ id: 'R1', cantidad: 2 }];
    vi.mocked(useGetRegistroActualOperacion).mockReturnValue({
      data: { rechazos, inicio: '2026-01-01T08:00:00Z' },
      isLoading: false,
      isFetching: false,
    } as any);

    const { result } = renderHook(() => useAdminOperacionData('OP-1'));

    expect(result.current.rechazosRegistroActual).toEqual(rechazos);
  });

  it('rechazosRegistroActual filtra rechazos globales por rango del registro', () => {
    const inicio = '2026-01-01T08:00:00Z';
    const fin = '2026-01-01T16:00:00Z';
    const rechazosGlobales = [
      { id: 'dentro', timestamp: '2026-01-01T10:00:00Z' },
      { id: 'fuera', timestamp: '2026-01-02T10:00:00Z' },
    ];
    vi.mocked(useGetRegistroActualOperacion).mockReturnValue({
      data: { inicio, fin },
      isLoading: false,
      isFetching: false,
    } as any);
    vi.mocked(useGetOperacionResumen).mockReturnValue({
      data: { rechazos: rechazosGlobales },
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useAdminOperacionData('OP-1'));

    expect(result.current.rechazosRegistroActual).toHaveLength(1);
    expect((result.current.rechazosRegistroActual[0] as any).id).toBe('dentro');
  });

  it('incidenciasParosRegistroActual incluye eventos tipo paro con incidencia asociada', () => {
    const idEvento = 'EVT-1';
    const eventos = [
      { id: idEvento, nombreTipoEvento: 'Paro', inicio: '2026-01-01T09:00:00Z', fin: '2026-01-01T10:00:00Z' },
    ];
    const incidencias = [
      { idEvento, nombreTipoIncidencia: 'Averia maquina', comentario: 'Roto' },
    ];
    vi.mocked(useGetRegistroActualOperacion).mockReturnValue({
      data: { eventos, incidencias, inicio: '2026-01-01T08:00:00Z' },
      isLoading: false,
      isFetching: false,
    } as any);

    const { result } = renderHook(() => useAdminOperacionData('OP-1'));

    expect(result.current.incidenciasParosRegistroActual).toHaveLength(1);
    expect(result.current.incidenciasParosRegistroActual[0].tipo).toBe('Averia maquina');
    expect(result.current.incidenciasParosRegistroActual[0].comentario).toBe('Roto');
  });

  it('incidenciasParosRegistroActual ignora eventos que no son paro ni incidencia', () => {
    const eventos = [
      { id: 'EVT-2', nombreTipoEvento: 'Inicio', inicio: '2026-01-01T08:00:00Z', fin: '-' },
    ];
    vi.mocked(useGetRegistroActualOperacion).mockReturnValue({
      data: { eventos, incidencias: [], inicio: '2026-01-01T08:00:00Z' },
      isLoading: false,
      isFetching: false,
    } as any);

    const { result } = renderHook(() => useAdminOperacionData('OP-1'));

    expect(result.current.incidenciasParosRegistroActual).toHaveLength(0);
  });

  it('incidenciasParosRegistroActual agrega incidencias sin evento vinculado', () => {
    vi.mocked(useGetRegistroActualOperacion).mockReturnValue({
      data: {
        eventos: [],
        incidencias: [{ nombreTipoIncidencia: 'Falta material', comentario: 'Sin stock' }],
        inicio: '2026-01-01T08:00:00Z',
      },
      isLoading: false,
      isFetching: false,
    } as any);

    const { result } = renderHook(() => useAdminOperacionData('OP-1'));

    expect(result.current.incidenciasParosRegistroActual).toHaveLength(1);
    expect(result.current.incidenciasParosRegistroActual[0].tipo).toBe('Falta material');
  });

  it('operacionId null/undefined: llama queries con undefined', () => {
    renderHook(() => useAdminOperacionData(null));

    expect(vi.mocked(useGetRegistroActualOperacion)).toHaveBeenCalledWith(undefined);
  });

  it('Expone estados de carga de ambas queries', () => {
    vi.mocked(useGetRegistroActualOperacion).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
    } as any);
    vi.mocked(useGetOperacionResumen).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    const { result } = renderHook(() => useAdminOperacionData('OP-1'));

    expect(result.current.isRegistroActualLoading).toBe(true);
    expect(result.current.isRegistroActualFetching).toBe(true);
    expect(result.current.isResumenLoading).toBe(true);
  });
});
