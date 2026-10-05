import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingState } from "../components/States";
export function ProtectedRoute() { const auth = useAuth(); const location = useLocation(); if (auth.status === "initializing") return <LoadingState />; if (auth.status !== "authenticated") return <Navigate to="/login" replace state={{ from: location.pathname }} />; return <Outlet />; }
export function AdminRoute() { const auth = useAuth(); if (auth.status === "initializing") return <LoadingState />; if (auth.status !== "authenticated") return <Navigate to="/login" replace />; if (auth.user?.role !== "ADMIN") return <Navigate to="/403" replace />; return <Outlet />; }
