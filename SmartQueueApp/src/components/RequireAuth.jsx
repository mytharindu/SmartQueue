import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export function RequireAuth({ children, roles }) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return null;
    }
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }
    return children;
}
