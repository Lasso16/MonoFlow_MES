import type { Operario } from "../model/aggregates/Operarios";

const ADMIN_SESSION_KEY = "monoflow.admin.session";

const normalizeText = (value?: string | null): string => {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export const readAdminSession = (): Operario | null => {
  const raw = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Operario;
    if (normalizeText(parsed?.rol) !== "admin") return null;
    if (!Number.isFinite(parsed?.numeroOperario)) return null;
    if (!parsed?.nombre) return null;

    return parsed;
  } catch {
    return null;
  }
};

export const saveAdminSession = (operario: Operario) => {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(operario));
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
};
