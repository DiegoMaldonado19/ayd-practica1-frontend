import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { ProtectedRoute, PublicOnlyRoute } from "@/auth/ProtectedRoute";
import { LoginPage } from "@/modules/auth/pages/LoginPage";
import { VerifyCodePage } from "@/modules/auth/pages/VerifyCodePage";
import { ForgotPasswordPage } from "@/modules/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/modules/auth/pages/ResetPasswordPage";
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import {MembersListPage} from "@/modules/members/pages/MembersListPage";
import { MemberFormPage } from "./modules/members/pages/MemberFormPage";
import { MemberDetailPage } from "./modules/members/pages/MemberDetailPage";

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
          { path: "/members", element: <MembersListPage/>},
          { path: "/members/new", element: <MemberFormPage/> },
          {path: "/members/:memberId", element: <MemberDetailPage/>},
          { path: "/members/:memberId/edit", element: <MemberFormPage/>},
        
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
