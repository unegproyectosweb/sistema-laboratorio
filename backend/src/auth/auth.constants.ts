import { ms } from "ms";

export const ACCESS_TOKEN_EXPIRES_IN = "15m";

export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
export const REFRESH_TOKEN_MAX_AGE_MS = ms("7d");

export const MAX_ACTIVE_REFRESH_SESSIONS = 5;
export const BCRYPT_SALT_ROUNDS = 10;
