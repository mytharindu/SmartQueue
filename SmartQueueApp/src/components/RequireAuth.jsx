import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export function RequireAuth({ children, adminOnly = false }) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return null;
    }
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (adminOnly && user.role !== "admin") {
        return <Navigate to="/" replace />;
    }
    return children;
}
