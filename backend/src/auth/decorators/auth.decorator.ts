import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { PermissionEnum } from "../auth.permissions.js";
import { AuthenticatedGuard } from "../guards/authenticated.guard.js";
import { PermissionsGuard } from "../guards/permissions.guard.js";
import { RequirePermissions } from "./permissions.decorator.js";

export function Auth(...permissions: PermissionEnum[]) {
  return applyDecorators(
    RequirePermissions(...permissions),
    UseGuards(AuthenticatedGuard, PermissionsGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: "Unauthorized" }),
  );
}
