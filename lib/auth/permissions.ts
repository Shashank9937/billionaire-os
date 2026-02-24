import { Role } from "@prisma/client";

export type PermissionKey =
  | "manageIdeas"
  | "manageCapital"
  | "manageVentures"
  | "exportData"
  | "manageUsers";

export const permissions: Record<PermissionKey, Role[]> = {
  manageIdeas: [Role.FOUNDER, Role.OPERATOR, Role.ADMIN],
  manageCapital: [Role.FOUNDER, Role.ADMIN],
  manageVentures: [Role.FOUNDER, Role.OPERATOR, Role.ADMIN],
  exportData: [Role.FOUNDER, Role.ANALYST, Role.ADMIN],
  manageUsers: [Role.ADMIN],
};

export function can(role: Role, permission: PermissionKey) {
  return permissions[permission].includes(role);
}
