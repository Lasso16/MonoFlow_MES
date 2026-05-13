import type { Operario } from '../../../../model/aggregates/Operarios';
import type { SesionOperarioDTO } from '../../../../model/aggregates/RegistroTrabajo';
import { ESTADOS } from '../../../../utils/estadoArticulosUtils';

export const mapSesionToOperario = (sesion: SesionOperarioDTO): Operario => ({
  id: sesion.id,
  nombre: sesion.nombre ?? sesion.operario?.nombre ?? '',
  numeroOperario: Number(sesion.numeroOperario ?? sesion.operario?.numeroOperario ?? 0),
  activo: true,
  rol: 'Operario',
});

export const requiereConfirmacionAlta = (estado?: string | number): boolean => {
  const normalized = String(estado ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (normalized === '') return true;

  const esExcluido = 
    normalized.includes('prepar') || 
    normalized === ESTADOS.PENDIENTE ||
    normalized.includes('deten') || 
    normalized.includes('paus') || 
    normalized.includes('finaliz') || 
    normalized === ESTADOS.FINALIZADA;

  return !esExcluido;
};

export const computeOperariosActivos = (
  registroOperarios: Operario[] | undefined,
  selectedOperarios: Operario[],
  hiddenOperarioIds: string[],
): Operario[] => {
  if (!registroOperarios || registroOperarios.length === 0) {
    return selectedOperarios.filter((op) => !hiddenOperarioIds.includes(op.id));
  }

  const seen = new Set<string>();
  const union: Operario[] = [];

  for (const op of registroOperarios) {
    if (!hiddenOperarioIds.includes(op.id) && !seen.has(op.id)) {
      union.push(op);
      seen.add(op.id);
    }
  }

  for (const op of selectedOperarios) {
    if (!hiddenOperarioIds.includes(op.id) && !seen.has(op.id)) {
      union.push(op);
      seen.add(op.id);
    }
  }

  return union;
};