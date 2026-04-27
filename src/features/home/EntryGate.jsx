import { Navigate } from "react-router-dom";

function EntryGate() {
  return <Navigate to="/intro" replace />;
}

export default EntryGate;