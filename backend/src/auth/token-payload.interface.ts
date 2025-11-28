import { RoleEnum } from "./auth.permissions.js";

export interface TokenPayload {
  sub: string;
  username: string;
  role: RoleEnum;
}
