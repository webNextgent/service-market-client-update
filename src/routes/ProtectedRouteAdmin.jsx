import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";


const ProtectedRouteAdmin = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (user.role !== "ADMIN") {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRouteAdmin;