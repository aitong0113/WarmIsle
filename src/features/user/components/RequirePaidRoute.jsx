import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function RequirePaidRoute({ children, featureName = "此功能" }) {
  const { authReady, isAuthenticated, hasPaidAccess } = useSelector((state) => state.user || {});
  const location = useLocation();

  if (!authReady) {
    return <div className="container">正在確認訂閱狀態…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasPaidAccess) {
    return <Navigate to="/account" replace state={{ lockedFeature: featureName, from: location.pathname }} />;
  }

  return children;
}

export default RequirePaidRoute;