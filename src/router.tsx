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
import { EmployeeFormPage } from "@/modules/employees/pages/EmployeeFormPage";
import { EmployeeDetailPage } from "@/modules/employees/pages/EmployeeDetailPage";
import { TrainersListPage } from "@/modules/trainers/pages/TrainersListPage";
import { TrainerDetailPage } from "@/modules/trainers/pages/TrainerDetailPage";
import { MembershipsListPage } from "@/modules/membership/pages/MembershipsListPage";
import { MembershipPlanFormPage } from "@/modules/membership/pages/MembershipPlanFormPage";
import { MembershipDetailPage } from "@/modules/membership/pages/MembershipDetailPage";
import { VisitsPage } from "@/modules/access/pages/VisitsPage";
import { GuestPassesPage } from "@/modules/access/pages/GuestPassesPage";
import { MembershipPlansListPage } from "./modules/membership/pages/MembershipPlansListPages";
import { ClassesListPage } from "@/modules/classes/pages/ClassesListPage";
import { ClassFormPage } from "@/modules/classes/pages/ClassFormPage";
import { ClassDetailPage } from "@/modules/classes/pages/ClassDetailPage";
import { ClassSessionDetailPage } from "@/modules/classes/pages/ClassSessionDetailPage";
import { PaymentsPage } from "@/modules/billing/pages/PaymentsPage";
import { PromotionsPage } from "@/modules/billing/pages/PromotionsPage";
import { NotificationsPage } from "@/modules/notifications/pages/NotificationsPage";

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
        
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/account/security", element: <SecuritySettingsPage /> },

          {
            element: <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]} />,
            children: [
              { path: "/members", element: <MembersListPage /> },
              { path: "/members/new", element: <MemberFormPage /> },
              { path: "/members/:memberId", element: <MemberDetailPage /> },
              { path: "/members/:memberId/edit", element: <MemberFormPage /> },

              {
                path: "/access",
                children: [
                  { index: true, element: <Navigate to="visits" replace /> },
                  { path: "visits", element: <VisitsPage /> },
                  { path: "guest-passes", element: <GuestPassesPage /> },
                ],
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
            children: [
              { path: "/employees", element: <EmployeesListPage /> },
              { path: "/employees/new", element: <EmployeeFormPage /> },
              { path: "/employees/:employeeId", element: <EmployeeDetailPage /> },
              { path: "/employees/:employeeId/edit", element: <EmployeeFormPage /> },

              // memberships 
              { path: "/membership-plans/new", element: <MembershipPlanFormPage /> },
              { path: "/membership-plans/:planId/edit", element: <MembershipPlanFormPage /> },
              { path: "/memberships", element: <MembershipsListPage /> },
              { path: "/memberships/:membershipId", element: <MembershipDetailPage /> },
              { path: "/membership-plans", element: <MembershipPlansListPage /> }
            ],
          },
          {
            path: "/classes",
            children: [
              { index: true, element: <ClassesListPage /> },
              { path: "new", element: <ClassFormPage /> },
              { path: ":classId", element: <ClassDetailPage /> },
              { path: ":classId/edit", element: <ClassFormPage /> },
              { path: ":classId/sessions/:sessionId", element: <ClassSessionDetailPage /> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]} />,
            children: [
              { path: "/trainers", element: <TrainersListPage /> },
              { path: "/trainers/:trainerId", element: <TrainerDetailPage /> },
              // { path: "/trainers/:trainerId/transfer", element: <TrainerDetailPage /> }, // TODO
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]} />,
            children: [
              { path: "/payments", element: <PaymentsPage /> },
              { path: "/promotions", element: <PromotionsPage /> },
            ],
          },
          {
            path: "/notifications",
            element: <NotificationsPage />,
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);