import { Role } from "@prisma/client";

export const permissions = {
  manageIdeas: [Role.FOUNDER, Role.OPERATOR, Role.ADMIN],
  manageCapital: [Role.FOUNDER, Role.ADMIN],
  manageVentures: [Role.FOUNDER, Role.OPERATOR, Role.ADMIN],
  exportData: [Role.FOUNDER, Role.ANALYST, Role.ADMIN],
  manageUsers: [Role.ADMIN],
} as const;

export type PermissionKey = keyof typeof permissions;

export function can(role: Role, permission: PermissionKey) {
  return permissions[permission].includes(role);
}
