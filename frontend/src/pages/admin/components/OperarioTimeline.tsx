import { Box, Tooltip, Typography } from "@mui/material";
import { extractSesionesActivas, formatDateTime } from "../utils/adminOperacionUtils";

const TRACK_COLORS = [
  "#1976d2",
  "#388e3c",
  "#f57c00",
  "#7b1fa2",
  "#c62828",
  "#00838f",
];

const LABEL_WIDTH = 120;

const formatTime = (isoString: string): string => {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return new Intl.DateTimeFormat("es-ES", { timeStyle: "short" }).format(d);
};

interface SessionSegment {
  inicio: number;
  fin: number;
  inicioStr: string;
  finStr: string;
}

interface OperarioRow {
  id: string;
  name: string;
  sessions: SessionSegment[];
}

const buildOperarioRowKey = (numeroOperario: string, operarioId: string, fallbackId: string): string => {
  if (numeroOperario.trim() !== "") {
    return `numero:${numeroOperario.trim()}`;
  }

  if (operarioId.trim() !== "") {
    return `operario:${operarioId.trim()}`;
  }

  return `fallback:${fallbackId}`;
};

interface Props {
  registro: unknown;
}

export const OperarioTimeline = ({ registro }: Props) => {
  const operariosRaw = extractSesionesActivas(registro);

  const registroInicioStr: string =
    (registro as any)?.inicio ?? (registro as any)?.Inicio ?? "";
  const registroFinStr: string =
    (registro as any)?.fin ?? (registro as any)?.Fin ?? "";

  const registroStart = new Date(registroInicioStr).getTime();
  const registroEnd = registroFinStr
    ? new Date(registroFinStr).getTime()
    : Date.now();
  const totalDuration = registroEnd - registroStart;

  const rowMap = new Map<string, OperarioRow>();

  for (const op of operariosRaw) {
    const key = buildOperarioRowKey(op.numeroOperario, op.operarioId, String(op.id));
    const nameParts = [op.numeroOperario.trim(), op.nombre.trim()].filter(Boolean);
    const name: string = nameParts.join(" - ");
    const inicioStr: string = op.inicio;
    const finStr: string = op.fin ?? "";
    const inicio = new Date(inicioStr).getTime();
    const fin = finStr ? new Date(finStr).getTime() : Date.now();

    if (Number.isNaN(inicio)) continue;

    const segment: SessionSegment = { inicio, fin, inicioStr, finStr };
    const existing = rowMap.get(key);
    if (existing) {
      existing.sessions.push(segment);
    } else {
      rowMap.set(key, { id: key, name, sessions: [segment] });
    }
  }

  const rows = Array.from(rowMap.values());

  if (rows.length === 0 || totalDuration <= 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        Sin personal registrado en este turno.
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
        <Box sx={{ width: LABEL_WIDTH, flexShrink: 0 }} />
        <Box sx={{ flex: 1, display: "flex", justifyContent: "space-between" }}>
          <Typography variant="caption" color="text.secondary">
            {formatDateTime(registroInicioStr)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {registroFinStr ? formatDateTime(registroFinStr) : "Ahora"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {rows.map((row, rowIndex) => {
          const color = TRACK_COLORS[rowIndex % TRACK_COLORS.length];
          const sessions = [...row.sessions].sort((a, b) => a.inicio - b.inicio);

          return (
            <Box key={row.id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: LABEL_WIDTH, flexShrink: 0 }}>
                <Typography
                  variant="caption"
                  noWrap
                  title={row.name}
                  sx={{ display: "block" }}
                >
                  {row.name}
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  position: "relative",
                  height: 20,
                  bgcolor: "grey.200",
                  borderRadius: 1,
                }}
              >
                {sessions.map((seg, segIndex) => {
                  const leftPct = Math.max(
                    0,
                    ((seg.inicio - registroStart) / totalDuration) * 100,
                  );
                  const widthPct = Math.min(
                    100 - leftPct,
                    ((seg.fin - seg.inicio) / totalDuration) * 100,
                  );
                  const tooltipLabel = `${seg.inicioStr ? formatTime(seg.inicioStr) : "?"} - ${seg.finStr ? formatTime(seg.finStr) : "Activo"}`;

                  return (
                    <Tooltip key={segIndex} title={tooltipLabel} placement="top" arrow>
                      <Box
                        sx={{
                          position: "absolute",
                          left: `${leftPct}%`,
                          width: `${Math.max(widthPct, 0.5)}%`,
                          height: "100%",
                          bgcolor: color,
                          borderRadius: 1,
                          cursor: "default",
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default OperarioTimeline;
