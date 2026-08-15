import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";

export function TrainingHomePage() {
  const { user } = useAuth();

  if (user?.role === "ADMIN") {
    return <Navigate to="/training/assignments" replace />;
  }
  if (user?.role === "TRAINER") {
    return <Navigate to="/training/my-members" replace />;
  }
  return <Navigate to="/training/me" replace />;
}
