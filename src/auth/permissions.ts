import type { Role } from "@/modules/auth/types";

export const ROLES: Role[] = ["ADMIN", "RECEPTIONIST", "TRAINER", "MEMBER"];

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrador",
  RECEPTIONIST: "Recepcionista",
  TRAINER: "Entrenador",
  MEMBER: "Socio",
};

export function hasRole(role: Role | undefined, expected: Role): boolean {
  return role === expected;
}

export function hasAnyRole(role: Role | undefined, allowed: Role[]): boolean {
  return role !== undefined && allowed.includes(role);
}

export const MODULE_ACCESS = {
  dashboard: ROLES,
  members: ["ADMIN", "RECEPTIONIST"] as Role[],
   employees: ["ADMIN"] as Role[],          
  trainers: ["ADMIN", "RECEPTIONIST"] as Role[],
  membershipPlans: ["ADMIN"] as Role[],    
  memberships: ["ADMIN", "RECEPTIONIST"] as Role[],
  billing: ["ADMIN", "RECEPTIONIST"] as Role[],
  access: ["ADMIN", "RECEPTIONIST"] as Role[],
  classes: ROLES,
  training: ["ADMIN", "TRAINER", "MEMBER"] as Role[],
  nutrition: ["ADMIN", "TRAINER", "MEMBER"] as Role[],
  notifications: ROLES,
  reports: ["ADMIN"] as Role[],
} satisfies Record<string, Role[]>;

export type ModuleKey = keyof typeof MODULE_ACCESS;

export function canAccessModule(role: Role | undefined, module: ModuleKey): boolean {
  return hasAnyRole(role, MODULE_ACCESS[module]);
}
