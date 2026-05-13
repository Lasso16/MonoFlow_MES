import { type Result } from "../model/Result";
import { type TipoEvento, type TipoIncidencia, type TipoOperacion, type TipoRechazo } from "../model/aggregates/Maestros";
import { API_URL, getAggregateList } from "./apiClient";

const urlMaestros = `${API_URL}/maestros`;

export const GET_tiposRechazo = async (): Promise<Result<TipoRechazo[]>> => {
  return await getAggregateList<TipoRechazo[]>(`${urlMaestros}/rechazos`);
};

export const GET_tiposIncidencia = async (): Promise<Result<TipoIncidencia[]>> => {
  return await getAggregateList<TipoIncidencia[]>(`${urlMaestros}/incidencias`);
};

export const GET_tiposEvento = async (): Promise<Result<TipoEvento[]>> => {
  return await getAggregateList<TipoEvento[]>(`${urlMaestros}/eventos`);
};

export const GET_tiposOperacion = async (): Promise<Result<TipoOperacion[]>> => {
  return await getAggregateList<TipoOperacion[]>(`${urlMaestros}/operaciones`);
};
