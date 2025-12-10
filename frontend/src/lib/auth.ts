import {
  AuthResponseSchema,
  type AuthResponse,
  type LoginType,
  type RegisterType,
  type UserType,
} from "@uneg-lab/api-types/auth.js";
import ky from "ky";
import { persist } from "zustand/middleware";
import { useStore } from "zustand/react";
import { createStore } from "zustand/vanilla";
import { apiClient } from "./api";

interface AuthState {
  refreshPromise: Promise<AuthResponse | null> | null;
  accessToken: string | null;
  user: UserType | null;
  getAccessToken(): Promise<string | null>;
  login(values: LoginType): Promise<AuthResponse>;
  register(values: RegisterType): Promise<void>;
  registerAdministrator(values: RegisterType): Promise<void>;
  logout(): Promise<void>;
}

const AUTH_STORAGE_KEY = "auth";

const authStore = createStore<AuthState>()(
  persist(
    (set, get) => {
      const setSession = (session: AuthResponse | null) => {
        set({
          accessToken: session?.accessToken || null,
          user: session?.user || null,
        });
      };
      return {
        refreshPromise: null,
        accessToken: null,
        user: null,

        async getAccessToken(): Promise<string | null> {
          if (get().refreshPromise && !get().accessToken) {
            await get().refreshPromise;
          }

          return get().accessToken;
        },

        async login(values): Promise<AuthResponse> {
          const data = await apiClient
            .post("auth/login", { json: values, retry: 0 })
            .json()
            .then(AuthResponseSchema.parse);

          setSession(data);

          return data;
        },

        async register(values): Promise<void> {
          const data = await apiClient
            .post("auth/register", { json: values, retry: 0 })
            .json()
            .then(AuthResponseSchema.parse);

          setSession(data);
        },
        async registerAdministrator(values): Promise<void> {
          await apiClient
            .post("auth/register/admin", {
              json: values,
              retry: 0,
            })
            .json()
            .then(AuthResponseSchema.parse);
        },
        async logout() {
          setSession(null);
          await apiClient.post("auth/logout", { retry: 0 }).catch(() => {});
        },
      };
    },
    {
      name: AUTH_STORAGE_KEY,
      // Persist only user metadata; accessToken stays in memory to avoid XSS/localStorage risks.
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

function setSession(session: AuthResponse | null) {
  authStore.setState({
    accessToken: session?.accessToken || null,
    user: session?.user || null,
  });
}

export function seemsAuthenticated(): boolean {
  const state = authStore.getState();
  return state.user !== null;
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

export async function getSession(): Promise<AuthResponse | null> {
  const state = authStore.getState();
  if (state.accessToken && state.user) {
    return {
      accessToken: state.accessToken,
      user: state.user,
    };
  }

  if (!state.user) {
    return null;
  }

  return await refreshSession();
}

export async function refreshSession(): Promise<AuthResponse | null> {
  let refreshPromise = authStore.getState().refreshPromise;
  if (refreshPromise) return refreshPromise;

  let resolveRefresh: (value: AuthResponse | null) => void;
  refreshPromise = new Promise<AuthResponse | null>((resolve) => {
    resolveRefresh = resolve;
  });
  authStore.setState({ refreshPromise });

  ky("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  })
    .then((response) =>
      response.ok ? response.json().then(AuthResponseSchema.parse) : null,
    )
    .catch(() => null)
    .then(async (data) => {
      setSession(data);
      resolveRefresh(data);
      authStore.setState({ refreshPromise: null });
    });

  return refreshPromise;
}

export const {
  getAccessToken,
  login,
  logout,
  register,
  registerAdministrator,
} = authStore.getState();

export function useUser() {
  const user = useStore(authStore, (state) => state.user);
  const isRefreshing = useStore(authStore, (state) => !!state.refreshPromise);

  return { user, isLoading: !user && isRefreshing };
}
