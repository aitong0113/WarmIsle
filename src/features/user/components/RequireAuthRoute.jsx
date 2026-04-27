import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function RequireAuthRoute({ children }) {
  const { authReady, isAuthenticated } = useSelector((state) => state.user || {});
  const location = useLocation();

  if (!authReady) {
    return <div className="container">正在確認登入狀態…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default RequireAuthRoute;