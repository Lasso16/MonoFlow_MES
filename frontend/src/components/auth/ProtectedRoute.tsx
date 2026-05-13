import { Navigate, Outlet, useLocation } from "react-router-dom";
import { readAdminSession } from "../../utils/authUtils";

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute = ({
  redirectPath = "/admin",
}: ProtectedRouteProps) => {
  const session = readAdminSession();
  const location = useLocation();

  if (!session) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <Outlet />;
};
