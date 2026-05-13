import { type AggregateModel } from "../AggregateModel";

export interface Orden extends AggregateModel {
  idNavision: string;
  descripcion: string;
  cliente?: string;
  codigoProcedencia?: string;
  estado?: string;
}

export interface CreateOrden {
  idNavision: string;
  descripcion: string;
  cliente?: string;
  codigoProcedencia?: string;
}

export interface UpdateOrden {
  descripcion?: string;
  cliente?: string;
  codigoProcedencia?: string;
}

export interface OrdenFilters {
  estado?: string | string[];
  idNavision?: string;
  cliente?: string;
}

export interface ArticuloOrden {
  id?: string;
  referencia: string;
  linea: number;
  cantidad: number;
  descripcion?: string;
  inicioPlan?: string;
  finPlan?: string;
}

export interface CreateArticuloOrden {
  referencia: string;
  linea: number;
  cantidad: number;
  descripcion?: string;
  inicioPlan?: string;
  finPlan?: string;
}

export interface EstadoPlantaOperarioDTO {
  idOperario: string;
  numeroOperario: number;
  nombre: string;
  rol: string;
  inicioSesion: string;
}

export interface EstadoPlantaRegistroDTO {
  idRegistro: string;
  inicio: string;
  totalProducidoOk: number;
  totalRechazado: number;
  operarios: EstadoPlantaOperarioDTO[];
}

export interface EstadoPlantaOperacionDTO {
  idOperacion: string;
  tipoOperacion: string;
  cantidadTotal: number;
  estado: string;
  registros: EstadoPlantaRegistroDTO[];
}

export interface EstadoPlantaArticuloDTO {
  idArticulo: string;
  referencia: string;
  cantidad: number;
  descripcion?: string;
  inicioPlan?: string;
  finPlan?: string;
  estado: string;
  progreso: number;
  operaciones: EstadoPlantaOperacionDTO[];
}

export interface EstadoPlantaDTO {
  idOrden: string;
  idNavision: string;
  cliente?: string;
  descripcion: string;
  estado: string;
  progreso: number;
  articulos: EstadoPlantaArticuloDTO[];
}

export interface CreateOrdenPayload {
  idNavision: string;
  cliente: string;
  codigoProcedencia: string;
  descripcion?: string;
}

export interface CreateArticuloPayload {
  referencia: string;
  linea: number;
  cantidad: number;
  descripcion?: string;
  inicioPlanificado?: string; 
  finPlanificado?: string;    
}