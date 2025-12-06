import { RoleEnum } from "@uneg-lab/api-types/auth.js";

export enum PermissionEnum {
  // Users
  READ_USERS = "users:read",
  CREATE_USERS = "users:create",
  UPDATE_USERS = "users:update",
  DELETE_USERS = "users:delete",
  CREATE_ADMIN = "users:create_admin",

  // Solicitudes
}

export const ROLE_PERMISSIONS: Record<RoleEnum, PermissionEnum[]> = {
  [RoleEnum.ADMIN]: [
    PermissionEnum.READ_USERS,
    PermissionEnum.CREATE_USERS,
    PermissionEnum.UPDATE_USERS,
    PermissionEnum.DELETE_USERS,
  ],
  [RoleEnum.USER]: [],
};

export function hasPermissions(
  userRole: RoleEnum,
  requiredPermissions: PermissionEnum[],
): boolean {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission),
  );
}

export function matchRoles(
  requiredRoles: RoleEnum[],
  userRole: RoleEnum,
): boolean {
  return requiredRoles.some((role) => userRole === role);
}
