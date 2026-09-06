import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, token } = useAuth();

  // User is not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in but does not have the required role
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // User is allowed to access the page
  return children;
}