import type { RoleEnum } from "@uneg-lab/api-types/auth.js";

export interface TokenPayload {
  sub: string;
  username: string;
  role: RoleEnum;
}
