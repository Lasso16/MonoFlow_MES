import { type AggregateModel } from "../AggregateModel";

export interface Articulo extends AggregateModel {
    idOrden: string;
    referencia: string;
    linea: number;
    cantidad: number;
    descripcion?: string;
    inicioPlan?: string;
    finPlan?: string;
    estado: string;
}

export interface ArticuloResponse extends AggregateModel {
    referencia: string;
    descripcion?: string;
    linea: number;
    cantidad: number;
    inicioPlan?: string | null;
    finPlan?: string | null;
    estado?: string;
    cantidadOperaciones?: number;
    CantidadOperaciones?: number;
}

export interface UpdateArticuloPayload {
    referencia?: string;
    descripcion?: string;
    linea?: number;
    cantidad?: number;
    estado?: string;
}


