import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowPasswordChange = false }) {
  const { isAuthenticated, mustChangePassword } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (mustChangePassword && !allowPasswordChange) {
    return <Navigate to="/set-new-password" replace />;
  }
  return children;
}
