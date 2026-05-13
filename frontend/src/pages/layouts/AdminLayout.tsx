import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { clearAdminSession, readAdminSession } from "../../utils/authUtils";

export const AdminLayout = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const adminOperario = readAdminSession();
	const isLoginPage =
		location.pathname === "/admin" || location.pathname === "/admin/login";
	const isDashboardHome = location.pathname === "/admin/dashboard";

	const handleLogout = () => {
		clearAdminSession();
		navigate("/admin", { replace: true });
	};

	return (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "grey.100", overflow: "hidden" }}>
			<Box
				component="header"
				sx={{
					px: 3,
					py: 2,
					bgcolor: "background.paper",
					borderBottom: "1px solid",
					borderColor: "divider",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					gap: 2,
				}}
			>
				<Box>
					<Typography variant="h6">MonoFlow Admin</Typography>
					{adminOperario ? (
						<Typography variant="body2" color="text.secondary">
							{adminOperario.nombre} (#{adminOperario.numeroOperario})
						</Typography>
					) : (
						<Typography variant="body2" color="text.secondary">
							Panel de administracion
						</Typography>
					)}
				</Box>

				<Box sx={{ display: "flex", gap: 1 }}>
					{adminOperario && !isLoginPage && !isDashboardHome && (
						<Button variant="outlined" onClick={() => navigate("/admin/dashboard")}>
							Dashboard
						</Button>
					)}
					{adminOperario && (
						<Button variant="outlined" color="inherit" onClick={handleLogout}>
							Cerrar sesión
						</Button>
					)}
				</Box>
			</Box>

			<Box
				component="main"
				sx={{
					flex: 1,
					minHeight: 0,
					px: 3,
					overflow: "auto",
				}}
			>
				<Outlet />
			</Box>
		</Box>
	);
};
