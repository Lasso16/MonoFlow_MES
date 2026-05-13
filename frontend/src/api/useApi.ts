import {
  GET_registroActualOperacion,
  GET_registroActivoOperario,
  MUTATE_observacionRegistroTrabajo,
  POST_abrirRegistroTrabajo,
  POST_registrarEvento,
  POST_registrarIncidencia,
  POST_registrarProduccion,
  POST_registrarRechazo,
  PUT_cerrarSesionOperario,
  PUT_finalizarRegistroTrabajo,
  DELETE_articulo,
  DELETE_operacion,
  DELETE_operario,
  DELETE_orden,
  GET_articuloById,
  GET_articulos,
  GET_articulosOrden,
  GET_estadoPlanta,
  GET_operacionById,
  GET_operacionProgreso,
  GET_operacionRegistros,
  GET_operacionResumen,
  GET_operaciones,
  GET_operacionesArticulo,
  GET_operarioById,
  GET_operarioByNumero,
  GET_operarios,
  GET_ordenById,
  GET_ordenes,
  GET_tiposEvento,
  GET_tiposIncidencia,
  GET_tiposOperacion,
  GET_tiposRechazo,
  POST_operacionArticulo,
  POST_articuloOrden,
  POST_finalizarOrden,
  POST_operario,
  POST_orden,
  POST_ordenArticulo,
  PUT_articulo,
  PUT_operacion,
  PUT_operario,
  PUT_orden,
  type OperarioFilters,
} from "./index.ts";
import {
  type CreateArticuloOrden,
  type OrdenFilters,
  type UpdateOrden,
  type CreateOrdenPayload,
  type CreateArticuloPayload,
} from "../model/aggregates/Ordenes";
import { type UpdateArticuloPayload } from "../model/aggregates/Articulos";
import {
  type CreateOperario,
  type UpdateOperario,
} from "../model/aggregates/Operarios";
import {
  type CreateOperacionPayload,
  type UpdateOperacionPayload,
} from "../model/aggregates/Operaciones";
import {
  type AbrirRegistroTrabajoPayload,
  type ObservacionMethod,
  type ObservacionRegistroTrabajoPayload,
  type RegistrarEventoPayload,
  type RegistrarIncidenciaPayload,
  type RegistrarProduccionPayload,
  type RegistrarRechazoPayload,
} from "../model/aggregates/RegistroTrabajo";

export const useApi = () => {
  const abrirRegistroTrabajo = async (
    operacionId: string,
    payload: AbrirRegistroTrabajoPayload,
  ) => {
    return await POST_abrirRegistroTrabajo(operacionId, payload);
  };

  const finalizarRegistroTrabajo = async (operacionId: string) => {
    return await PUT_finalizarRegistroTrabajo(operacionId);
  };

  const addObservacionRegistroTrabajo = async (
    operacionId: string,
    payload: ObservacionRegistroTrabajoPayload,
    method: ObservacionMethod,
  ) => {
    return await MUTATE_observacionRegistroTrabajo(operacionId, payload, method);
  };

  const registrarProduccion = async (
    operacionId: string,
    payload: RegistrarProduccionPayload,
  ) => {
    return await POST_registrarProduccion(operacionId, payload);
  };

  const registrarRechazo = async (
    operacionId: string,
    payload: RegistrarRechazoPayload,
  ) => {
    return await POST_registrarRechazo(operacionId, payload);
  };

  const registrarEvento = async (
    operacionId: string,
    payload: RegistrarEventoPayload,
  ) => {
    return await POST_registrarEvento(operacionId, payload);
  };

  const registrarIncidencia = async (
    operacionId: string,
    payload: RegistrarIncidenciaPayload,
  ) => {
    return await POST_registrarIncidencia(operacionId, payload);
  };

  const cerrarSesionOperario = async (operarioId: string) => {
    return await PUT_cerrarSesionOperario(operarioId);
  };

  const getRegistroActivoOperario = async (operarioId: string) => {
    return await GET_registroActivoOperario(operarioId);
  };

  const getRegistroActualOperacion = async (operacionId: string) => {
    return await GET_registroActualOperacion(operacionId);
  };

  const getArticulos = async (
    pageNumber?: number,
    pageSize?: number,
    filters?: {
      soloPendientes?: boolean;
      estado?: string;
      referencia?: string;
      descripcion?: string;
    },
  ) => {
    return await GET_articulos(pageNumber, pageSize, filters);
  };

  const getArticuloById = async (id: string) => {
    return await GET_articuloById(id);
  };

  const getOperacionesArticulo = async (id: string) => {
    return await GET_operacionesArticulo(id);
  };

  const addOperacionArticulo = async (id: string, payload: CreateOperacionPayload) => {
    return await POST_operacionArticulo(id, payload);
  };

  const updateArticulo = async (id: string, payload: UpdateArticuloPayload) => {
    return await PUT_articulo(id, payload);
  };

  const deleteArticulo = async (id: string) => {
    return await DELETE_articulo(id);
  };

  const getOperarios = async (filters?: OperarioFilters) => {
    return await GET_operarios(filters);
  };

  const getOperarioById = async (id: string) => {
    return await GET_operarioById(id);
  };

  const getOperarioByNumero = async (numero: number) => {
    return await GET_operarioByNumero(numero);
  };

  const createOperario = async (payload: CreateOperario) => {
    return await POST_operario(payload);
  };

  const updateOperario = async (id: string, payload: UpdateOperario) => {
    return await PUT_operario(id, payload);
  };

  const deleteOperario = async (id: string) => {
    return await DELETE_operario(id);
  };

  const getOperaciones = async (pageNumber?: number, pageSize?: number) => {
    return await GET_operaciones(pageNumber, pageSize);
  };

  const getOperacionById = async (id: string) => {
    return await GET_operacionById(id);
  };

  const getOperacionProgreso = async (id: string) => {
    return await GET_operacionProgreso(id);
  };

  const getOperacionRegistros = async (id: string) => {
    return await GET_operacionRegistros(id);
  };

  const getOperacionResumen = async (id: string) => {
    return await GET_operacionResumen(id);
  };

  const updateOperacion = async (id: string, payload: UpdateOperacionPayload) => {
    return await PUT_operacion(id, payload);
  };

  const deleteOperacion = async (id: string) => {
    return await DELETE_operacion(id);
  };

  const getOrdenes = async (pageNumber?: number, pageSize?: number, filters?: OrdenFilters) => {
    return await GET_ordenes(pageNumber, pageSize, filters);
  };

  const getOrdenById = async (id: string) => {
    return await GET_ordenById(id);
  };

  const getEstadoPlanta = async () => {
    return await GET_estadoPlanta();
  };

  const getArticulosOrden = async (id: string) => {
    return await GET_articulosOrden(id);
  };

  const createOrden = async (payload: CreateOrdenPayload) => {
    return await POST_orden(payload);
  };

  const createArticuloOrden = async (idOrden: string, payload: CreateArticuloPayload) => {
    return await POST_ordenArticulo(idOrden, payload);
  };

  const updateOrden = async (id: string, payload: UpdateOrden) => {
    return await PUT_orden(id, payload);
  };

  const deleteOrden = async (id: string) => {
    return await DELETE_orden(id);
  };

  const addArticuloOrden = async (id: string, payload: CreateArticuloOrden) => {
    return await POST_articuloOrden(id, payload);
  };

  const finalizarOrden = async (id: string) => {
    return await POST_finalizarOrden(id);
  };

  const getTiposRechazo = async () => {
    return await GET_tiposRechazo();
  };

  const getTiposIncidencia = async () => {
    return await GET_tiposIncidencia();
  };

  const getTiposEvento = async () => {
    return await GET_tiposEvento();
  };

  const getTiposOperacion = async () => {
    return await GET_tiposOperacion();
  };

  return {
    abrirRegistroTrabajo,
    finalizarRegistroTrabajo,
    addObservacionRegistroTrabajo,
    registrarProduccion,
    registrarRechazo,
    registrarEvento,
    registrarIncidencia,
    cerrarSesionOperario,
    getRegistroActivoOperario,
    getRegistroActualOperacion,
    getArticulos,
    getArticuloById,
    getOperacionesArticulo,
    addOperacionArticulo,
    updateArticulo,
    deleteArticulo,
    getOperarios,
    getOperarioById,
    getOperarioByNumero,
    createOperario,
    updateOperario,
    deleteOperario,
    getOperaciones,
    getOperacionById,
    getOperacionProgreso,
    getOperacionRegistros,
    getOperacionResumen,
    updateOperacion,
    deleteOperacion,
    getTiposRechazo,
    getTiposIncidencia,
    getTiposEvento,
    getTiposOperacion,
    getOrdenes,
    getOrdenById,
    getEstadoPlanta,
    getArticulosOrden,
    createOrden,
    createArticuloOrden,
    updateOrden,
    deleteOrden,
    addArticuloOrden,
    finalizarOrden,
  };
};
