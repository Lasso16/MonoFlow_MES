import { type AggregateModel } from "../AggregateModel";

export interface Operario extends AggregateModel {
    numeroOperario: number;
    nombre: string;
    activo: boolean;
    rol: string;
}

export interface CreateOperario {
    numeroOperario: number;
    nombre: string;
}

export interface UpdateOperario {
    nombre: string;
}

export type OperarioFilters = {
  nombre?: string;
  numeroOperario?: number;
  activo?: boolean;
};