import { useEffect, useMemo, useState } from 'react';
import {
  getEventoColor,
  getSortTime,
  getStringField,
  parseDateTime,
  pickText,
  toNumber,
} from '../components/TerminalHistoryTable/TerminalHistoryTable.utils';
import { useGetTiposEvento } from '../../../hooks/queries/useMaestrosQueries';
import type { RegistroActualOperacionResponse } from '../../../model/aggregates/RegistroTrabajo';
import type { EventoTableRow, EventoLike, IncidenciaLike } from '../components/TerminalHistoryTable/TerminalHistoryTable.types';

export const useTerminalHistoryData = (
  registroActualOperacion?: RegistroActualOperacionResponse,
  isHistoryExpanded = false
) => {
  const [now, setNow] = useState(() => Date.now());
  const { data: tiposEvento = [] } = useGetTiposEvento();

  // 1. Mapeo de Tipos
  const tipoEventoById = useMemo(() => tiposEvento.reduce<Record<number, string>>((acc, tipo) => {
    acc[tipo.id] = tipo.tipo;
    return acc;
  }, {}), [tiposEvento]);

  // 2. Extracción y cálculo de Eventos e Incidencias
  const eventosBase: EventoTableRow[] = useMemo(() => 
    ((registroActualOperacion?.eventos as EventoLike[] | undefined) ?? []).map((evento) => {
      const idTipoEvento = toNumber(evento.idTipoEvento ?? evento.IdTipoEvento);
      const tipoEvento = pickText(idTipoEvento ? tipoEventoById[idTipoEvento] : undefined, evento.nombreTipoEvento, evento.NombreTipoEvento) ?? 'Evento';
      const inicio = pickText(evento.inicio, evento.Inicio);
      const fin = pickText(evento.fin, (evento as EventoLike & { Fin?: string }).Fin);
      const inicioMs = parseDateTime(inicio);
      const finMs = parseDateTime(fin);

      return {
        id: evento.idEvento ?? evento.IdEvento ?? `${tipoEvento}-${inicio ?? 'sin-inicio'}`,
        tipoEvento,
        inicio,
        inicioMs,
        fin,
        finMs,
        color: getEventoColor(tipoEvento),
        isIncidencia: tipoEvento.toLowerCase().includes('incidenc'),
        sortTime: getSortTime(inicio),
        duracionMs: typeof inicioMs === 'number' && typeof finMs === 'number' ? Math.max(0, finMs - inicioMs) : undefined,
      };
    }), [registroActualOperacion, tipoEventoById]);

  const incidenciasBase = useMemo(() => 
    ((registroActualOperacion?.incidencias as IncidenciaLike[] | undefined) ?? []).map((incidencia) => ({
      idEvento: getStringField(incidencia as unknown as Record<string, unknown>, ['idEvento', 'IdEvento', 'eventoId', 'EventoId', 'id_evento']),
      tipo: pickText(incidencia.nombreTipoIncidencia, incidencia.NombreTipoIncidencia) ?? 'Incidencia',
      comentario: pickText(incidencia.comentario ?? undefined, incidencia.Comentario ?? undefined) ?? '-',
    })), [registroActualOperacion]);

  const incidenciasPorEventoId = useMemo(() => 
    incidenciasBase.reduce<Record<string, { tipo: string; comentario: string }>>((acc, inc) => {
      if (inc.idEvento) acc[inc.idEvento] = { tipo: inc.tipo, comentario: inc.comentario };
      return acc;
    }, {}), [incidenciasBase]);

  const incidenciasFallback = useMemo(() => incidenciasBase.filter((inc) => !inc.idEvento), [incidenciasBase]);

  // 3. Ordenación y Enriquecimiento
  const eventosOrdenados = useMemo(() => [...eventosBase].sort((a, b) => b.sortTime - a.sortTime || String(b.id).localeCompare(String(a.id))), [eventosBase]);

  const eventosEnriquecidos = useMemo(() => {
    let fallbackIndex = incidenciasFallback.length - 1;
    return eventosOrdenados.map((evento) => {
      if (!evento.isIncidencia || incidenciasPorEventoId[evento.id]) return evento;
      fallbackIndex -= 1;
      return evento;
    });
  }, [eventosOrdenados, incidenciasFallback.length, incidenciasPorEventoId]);

  // 4. Temporizador en vivo para el evento actual
  const hasLiveEvent = useMemo(() => eventosEnriquecidos.some((e) => !e.fin && typeof e.inicioMs === 'number'), [eventosEnriquecidos]);

  useEffect(() => {
    if (!hasLiveEvent) return;
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [hasLiveEvent]);

  // 5. Filtro Final
  const eventosConDuracion = useMemo(() => eventosEnriquecidos.map((e) => 
    (e.fin || typeof e.inicioMs !== 'number') ? e : { ...e, duracionMs: Math.max(0, now - e.inicioMs) }
  ), [eventosEnriquecidos, now]);

  const eventosVisibles = useMemo(() => 
    isHistoryExpanded ? eventosConDuracion : eventosConDuracion.slice(0, 1), 
  [eventosConDuracion, isHistoryExpanded]);

  return {
    eventosVisibles,
    hasMultipleEvents: eventosConDuracion.length > 1,
    totalEventos: eventosConDuracion.length
  };
};