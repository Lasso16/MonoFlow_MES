export interface TipoRechazo {
  id: number;
  tipo: string;
  motivo?: string;
}

export interface TipoIncidencia {
  id: number;
  tipo: string;
}

export interface TipoEvento {
  id: number;
  tipo: string;
}

export interface TipoOperacion {
  id: number;
  tipo?: string;
  nombre?: string;
  descripcion?: string;
}
