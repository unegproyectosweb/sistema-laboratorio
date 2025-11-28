import { SetMetadata } from "@nestjs/common";
import { RoleEnum } from "../auth.permissions.js";

export const ROLES_KEY = "roles";
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);
