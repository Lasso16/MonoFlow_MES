import { Box, Typography, Button, Paper } from "@mui/material";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import type { FallbackProps } from "react-error-boundary";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return "Error desconocido";
};

export const GlobalErrorFallback = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  const errorMessage = getErrorMessage(error);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        p: 3,
      }}
    >
      <Paper
        sx={{ p: 4, maxWidth: 500, textAlign: "center", borderRadius: 2 }}
        elevation={3}
      >
        <ErrorOutlinedIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          ¡Ups! Algo salió mal.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Ha ocurrido un error inesperado al cargar este componente.
        </Typography>

        <Box
          sx={{
            bgcolor: "grey.100",
            p: 2,
            borderRadius: 1,
            mb: 3,
            overflowX: "auto",
            textAlign: "left",
          }}
        >
          <Typography
            variant="caption"
            component="pre"
            color="error"
            sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
          >
            {errorMessage}
          </Typography>
        </Box>

        <Button variant="contained" onClick={resetErrorBoundary}>
          Volver a intentar
        </Button>
      </Paper>
    </Box>
  );
};
