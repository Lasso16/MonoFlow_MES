import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import App from "./App";

const AdminDashboard = lazy(() =>
  import("./pages/admin/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  })),
);
const AdminReportsPage = lazy(() =>
  import("./pages/admin/AdminReportsPage").then((m) => ({
    default: m.AdminReportsPage,
  })),
);
const AdminLoginPage = lazy(() =>
  import("./pages/admin/AdminLoginPage").then((m) => ({
    default: m.AdminLoginPage,
  })),
);
const AdminPlantStatusPage = lazy(() =>
  import("./pages/admin/AdminPlantStatusPage").then((m) => ({
    default: m.AdminPlantStatusPage,
  })),
);
const AdminOrdersPage = lazy(() =>
  import("./pages/admin/AdminOrdersPage").then((m) => ({
    default: m.AdminOrdersPage,
  })),
);
const AdminOrderDetailPage = lazy(() =>
  import("./pages/admin/AdminOrderDetailPage").then((m) => ({
    default: m.AdminOrderDetailPage,
  })),
);
const TerminalPage = lazy(() =>
  import("./pages/terminal/TerminalPage").then((m) => ({
    default: m.TerminalPage,
  })),
);
const AdminCreateOrderPage = lazy(() =>
  import("./pages/admin/AdminCreateOrderPage").then((m) => ({
    default: m.AdminCreateOrderPage,
  })),
);
const AdminLayout = lazy(() =>
  import("./pages/layouts/AdminLayout").then((m) => ({
    default: m.AdminLayout,
  })),
);
const TerminalLayout = lazy(() =>
  import("./pages/layouts/TerminalLayout").then((m) => ({
    default: m.TerminalLayout,
  })),
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/terminal" replace /> },

      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminLoginPage /> },
          { path: "login", element: <AdminLoginPage /> },
          {
            element: <ProtectedRoute redirectPath="/admin" />,
            children: [
              { path: "dashboard", element: <AdminDashboard /> },
              { path: "ordenes", element: <AdminOrdersPage /> },
              {
                path: "crear-orden",
                element: <AdminCreateOrderPage />,
              },
              {
                path: "ordenes/:id",
                element: <AdminOrderDetailPage />,
              },
              {
                path: "estado-planta",
                element: <AdminPlantStatusPage />,
              },
              { path: "informes", element: <AdminReportsPage /> },
            ],
          },
        ],
      },

      {
        element: <TerminalLayout />,
        children: [
          { path: "terminal", element: <TerminalPage /> },
          { path: "terminal/operacion/:id", element: <TerminalPage /> },
        ],
      },
    ],
  },
]);
