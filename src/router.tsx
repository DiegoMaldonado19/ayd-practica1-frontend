import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { ProtectedRoute, PublicOnlyRoute } from "@/auth/ProtectedRoute";
import { LoginPage } from "@/modules/auth/pages/LoginPage";
import { VerifyCodePage } from "@/modules/auth/pages/VerifyCodePage";
import { ForgotPasswordPage } from "@/modules/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/modules/auth/pages/ResetPasswordPage";
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import { SecuritySettingsPage } from "@/modules/auth/pages/SecuritySettingsPage";
import { MembersListPage } from "@/modules/members/pages/MembersListPage";
import { MemberFormPage } from "@/modules/members/pages/MemberFormPage";
import { MemberDetailPage } from "@/modules/members/pages/MemberDetailPage";
import { EmployeesListPage } from "@/modules/employees/pages/EmployeesListPage";
import { EmployeeFormPage } from "./modules/employees/pages/EmployeeFormPage";
import { EmployeeDetailPage } from "./modules/employees/pages/EmployeeDetailPage";
import { TrainersListPage } from './modules/trainers/pages/TrainersListPage';
import { TrainerDetailPage } from './modules/trainers/pages/TrainerDetailPage';


export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/verify-code", element: <VerifyCodePage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/reset-password", element: <ResetPasswordPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/account/security", element: <SecuritySettingsPage /> },
          {
            // OJO: confirma en src/modules/auth/types.ts que el Role type
            // usa exactamente estos strings ("ADMIN", "RECEPTIONIST").
            element: <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]} />,
            children: [
              { path: "/members", element: <MembersListPage /> },
              { path: "/members/new", element: <MemberFormPage /> },
              { path: "/members/:memberId", element: <MemberDetailPage /> },
              { path: "/members/:memberId/edit", element: <MemberFormPage /> },
            ],
          },
          {
            // Employees: solo ADMIN da de alta/gestiona personal, según
            // FRONTEND_BACKEND_OVERVIEW.md ("Solo el administrador puede
            // usarlo"). Verifícalo también en SecurityConfig.java del backend.
            element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
            children: [
              { path: "/employees", element: <EmployeesListPage /> },
             { path: "/employees/new", element: <EmployeeFormPage /> },
            { path: "/employees/:employeeId", element: <EmployeeDetailPage /> },
            {
            path: "/employees/:employeeId/edit",
            element: <EmployeeFormPage />,
          }
            ],
          },
          {
               // Trainers: listado/detalle visible para ADMIN y RECEPTIONIST
            // (por ejemplo, para asignar entrenador a un socio). Ajusta
            // si el enunciado/backend restringe distinto.
            element: <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]} />,
            children: [
              { path: "/trainers", element: <TrainersListPage /> },
              { path: "/trainers/:trainerId", element: <TrainerDetailPage /> },
            ],
          },  

        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);