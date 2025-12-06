import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { apiClient } from "./api";
import ky from "ky";

interface UserData {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

interface AuthDto {
  accessToken: string;
  user: UserData;
}

interface LoginDto {
  username: string;
  password: string;
}

interface RegisterDto {
  username: string;
  name: string;
  email: string;
  password: string;
}

interface AuthState {
  refreshPromise: Promise<AuthDto | null> | null;
  accessToken: string | null;
  user: UserData | null;
  getAccessToken(): Promise<string | null>;
  login(values: LoginDto): Promise<AuthDto>;
  register(values: RegisterDto): Promise<void>;
  registerAdministrator(values: RegisterDto): Promise<void>;
  logout(): Promise<void>;
}

const AUTH_STORAGE_KEY = "auth";

const authStore = createStore<AuthState>()(
  persist(
    (set, get) => {
      const setSession = (session: AuthDto | null) => {
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

        async login(values: LoginDto): Promise<AuthDto> {
          const data = await apiClient
            .post("auth/login", { json: values, retry: 0 })
            .json<AuthDto>();

          setSession(data);

          return data;
        },

        async register(values: RegisterDto): Promise<void> {
          const data = await apiClient
            .post("auth/register", {
              json: values,
              retry: 0,
            })
            .json<AuthDto>();
          setSession(data);
        },
        async registerAdministrator(values: RegisterDto): Promise<void> {
          await apiClient
            .post("auth/register/admin", {
              json: values,
              retry: 0,
            })
            .json<AuthDto>();
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

function setSession(session: AuthDto | null) {
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

export async function getSession(): Promise<AuthDto | null> {
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

export async function refreshSession(): Promise<AuthDto | null> {
  let refreshPromise = authStore.getState().refreshPromise;
  if (refreshPromise) return refreshPromise;

  let resolveRefresh: (value: AuthDto | null) => void;
  refreshPromise = new Promise<AuthDto | null>((resolve) => {
    resolveRefresh = resolve;
  });
  authStore.setState({ refreshPromise });

  ky("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  })
    .then((response) => (response.ok ? response.json<AuthDto>() : null))
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
