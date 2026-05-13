type RawRecord = Record<string, unknown>;

export type SesionActivaAdmin = {
  id: string;
  operarioId: string;
  numeroOperario: string;
  nombre: string;
  inicio: string;
  fin: string | null;
};

export const formatDateTime = (value?: string | null): string => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
};

const pickRecord = (value: unknown, keys: string[]): RawRecord | null => {
  if (typeof value !== "object" || value === null) return null;
  const data = value as RawRecord;

  for (const key of keys) {
    const candidate = data[key];
    if (typeof candidate === "object" && candidate !== null && !Array.isArray(candidate)) {
      return candidate as RawRecord;
    }
  }

  return null;
};

const pickTextFromRecord = (source: RawRecord | null, keys: string[], fallback = ""): string => {
  if (!source) return fallback;

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
    if (typeof value === "number") return String(value);
  }

  return fallback;
};

export const extractSesionesActivas = (value: unknown): SesionActivaAdmin[] => {
  if (typeof value !== "object" || value === null) return [];
  const data = value as Record<string, unknown>;
  const raw =
    data.sesionesActivas ?? data.SesionesActivas ?? data.operarios ?? data.Operarios;

  if (!Array.isArray(raw)) return [];

  return raw.map((item: unknown, index: number) => {
    const entry = typeof item === "object" && item !== null ? (item as RawRecord) : {};
    const operario = pickRecord(item, ["operario", "Operario"]);

    const operarioId = pickTextFromRecord(
      operario ?? entry,
      ["operarioId", "OperarioId", "id", "Id", "idOperario", "IdOperario"],
      String(index),
    );
    const id = pickTextFromRecord(entry, ["id", "Id", "idSesion", "IdSesion"], operarioId);
    const numeroOperario = pickTextFromRecord(
      operario ?? entry,
      ["numeroOperario", "NumeroOperario"],
      "",
    );
    const nombre = pickTextFromRecord(
      operario ?? entry,
      ["nombre", "Nombre", "nombreOperario", "NombreOperario"],
      operarioId,
    );

    return {
      id: id || operarioId,
      operarioId,
      numeroOperario,
      nombre,
      inicio: pickTextFromRecord(entry, ["inicio", "Inicio"], ""),
      fin: pickTextFromRecord(entry, ["fin", "Fin"], null as unknown as string) || null,
    };
  });
};

export const toArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "object" && value !== null) {
    const data = value as Record<string, unknown>;
    if (Array.isArray(data.$values)) return data.$values;
  }
  return [];
};

export const pickArray = (source: unknown, keys: string[]): unknown[] => {
  if (typeof source !== "object" || source === null) return [];
  const data = source as Record<string, unknown>;

  for (const key of keys) {
    const arrayValue = toArray(data[key]);
    if (arrayValue.length > 0) return arrayValue;
    if (Array.isArray(data[key])) return data[key] as unknown[];
  }

  return [];
};

export const pickText = (
  source: unknown,
  keys: string[],
  fallback = "-",
): string => {
  if (typeof source !== "object" || source === null) return fallback;
  const data = source as Record<string, unknown>;

  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
    if (typeof value === "number") return String(value);
  }
  return fallback;
};

export const pickNumber = (
  source: unknown,
  keys: string[],
  fallback = 0,
): number => {
  if (typeof source !== "object" || source === null) return fallback;
  const data = source as Record<string, unknown>;

  for (const key of keys) {
    const value = data[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return fallback;
};

export default null;