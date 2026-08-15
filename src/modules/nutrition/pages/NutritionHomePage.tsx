import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";

export function NutritionHomePage() {
  const { user } = useAuth();

  if (user?.role === "MEMBER") {
    return <Navigate to="/nutrition/me" replace />;
  }
  return <Navigate to="/nutrition/foods" replace />;
}
