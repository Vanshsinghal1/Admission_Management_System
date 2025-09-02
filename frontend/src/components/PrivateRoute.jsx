import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/useAuth"; // yeh custom hook banayenge

export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) return <Navigate to="/login" />;

  if (roles && roles.length && !roles.includes(user.role)) {
    return <p className="text-center mt-10 text-red-500">Access Denied</p>;
  }

  return children;
}
