import {
  AssessmentOutlined,
  ManageSearchOutlined,
  PrecisionManufacturingOutlined,
} from "@mui/icons-material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { GlobalErrorFallback } from "../../components/errors/GlobalErrorFallback";

const ADMIN_MODULE_ROUTES = [
  {
    title: "Órdenes",
    path: "/admin/ordenes",
    icon: <ManageSearchOutlined />,
  },
  {
    title: "Crear orden",
    path: "/admin/crear-orden",
    icon: <AddRoundedIcon />,
  },
  {
    title: "Estado de planta",
    path: "/admin/estado-planta",
    icon: <PrecisionManufacturingOutlined />,
  },
  {
    title: "Generar informes",
    path: "/admin/informes",
    icon: <AssessmentOutlined />,
  },
] as const;

export const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="md"
      sx={{
        height: "calc(100dvh - 74px - 48px)",
        maxHeight: "calc(100dvh - 74px - 48px)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        py: 1.5,
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 3, textAlign: "center" }}
      >
        Dashboard Administracion
      </Typography>

      {/* Tu cuadrícula de 4 botones originales, ahora protegida */}
      <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
        <Box
          sx={{
            width: "100%",
            maxWidth: 720,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          {ADMIN_MODULE_ROUTES.map((item) => (
            <Button
              key={item.path}
              variant="contained"
              size="large"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{ py: { xs: 2, sm: 2.25 } }}
            >
              {item.title}
            </Button>
          ))}
        </Box>
      </ErrorBoundary>
    </Container>
  );
};
