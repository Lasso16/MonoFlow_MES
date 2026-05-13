import { useMemo } from 'react';
import type { TipoRechazo } from '../../../model/aggregates/Maestros';

export const useTiposRechazoNormalizados = (tiposRechazo: TipoRechazo[]): TipoRechazo[] => {
  return useMemo(() => {
    return tiposRechazo.flatMap((item) => {
      const data = item as TipoRechazo & {
        Id?: number;
        Tipo?: string;
        Motivo?: string;
      };

      const id =
        (typeof data.id === 'number' && Number.isFinite(data.id) ? data.id : undefined) ??
        (typeof data.Id === 'number' && Number.isFinite(data.Id) ? data.Id : undefined);

      const tipo =
        (typeof data.tipo === 'string' && data.tipo.trim() !== '' ? data.tipo.trim() : undefined) ??
        (typeof data.Tipo === 'string' && data.Tipo.trim() !== '' ? data.Tipo.trim() : undefined) ??
        (typeof data.motivo === 'string' && data.motivo.trim() !== '' ? data.motivo.trim() : undefined) ??
        (typeof data.Motivo === 'string' && data.Motivo.trim() !== '' ? data.Motivo.trim() : undefined) ??
        'Motivo de rechazo';

      if (typeof id !== 'number') return [];

      return [{
        id,
        tipo,
        motivo: data.motivo ?? data.Motivo,
      }];
    });
  }, [tiposRechazo]);
};
