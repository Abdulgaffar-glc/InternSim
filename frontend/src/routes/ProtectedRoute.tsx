import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // or spinner

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
