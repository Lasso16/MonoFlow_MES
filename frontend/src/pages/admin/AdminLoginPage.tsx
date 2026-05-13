import { useEffect, useState, type SubmitEventHandler } from "react";
import { Alert, Box, Button, CircularProgress, Container, Paper, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../api/useApi";
import type { Operario } from "../../model/aggregates/Operarios";
import { readAdminSession, saveAdminSession } from "../../utils/authUtils";

const normalizeText = (value?: string | null): string => {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export const AdminLoginPage = () => {
  const { getOperarioByNumero } = useApi();
  const navigate = useNavigate();

  const [numeroOperarioInput, setNumeroOperarioInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const session = readAdminSession();
    if (!session) return;

    navigate("/admin/dashboard", { replace: true });
  }, [navigate]);

  const handleLogin = async () => {
    const numero = Number(numeroOperarioInput.trim());

    if (!Number.isFinite(numero) || numero < 0) {
      setErrorMessage("Introduce un numero de operario valido.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getOperarioByNumero(numero);

      if (result.isFailure) {
        setErrorMessage("No se encontro el operario.");
        return;
      }

      const operario = result.value as Operario;
      const rol = normalizeText(operario.rol);

      if (rol !== "admin") {
        setErrorMessage("El operario no tiene rol de Admin.");
        return;
      }

      saveAdminSession(operario);
      navigate("/admin/dashboard", { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitLogin: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (isLoading || numeroOperarioInput.trim() === "") return;

    void handleLogin();
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", py: 6 }}>
      <Container maxWidth="sm">
        <Paper
          component="form"
          elevation={2}
          sx={{ p: 4 }}
          onSubmit={handleSubmitLogin}
        >
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}
          ></Box>
          <Typography variant="h5" component="h1" gutterBottom>
            Acceso Administracion
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Introduce tu numero de operario para acceder al panel.
          </Typography>

          <TextField
            fullWidth
            label="Numero de operario"
            type="text"
            value={numeroOperarioInput}
            onChange={(event) => setNumeroOperarioInput(event.target.value)}
            slotProps={{ htmlInput: { min: 0 } }}
            disabled={isLoading}
          />

          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || numeroOperarioInput.trim() === ""}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Entrar"
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
