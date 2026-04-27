import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function RequireAdminRoute({ children }) {
  const { authReady, isAuthenticated, isAdmin } = useSelector((state) => state.user || {});
  const location = useLocation();

  if (!authReady) {
    return <div className="container">正在確認管理權限…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return children;
}

export default RequireAdminRoute;