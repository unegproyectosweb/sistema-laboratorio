import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { apiClient } from "./api";

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
            .post("api/auth/login", { json: values, retry: 0 })
            .json<AuthDto>();

          setSession(data);

          return data;
        },

        async register(values: RegisterDto): Promise<void> {
          const data = await apiClient
            .post("api/auth/register", {
              json: values,
              retry: 0,
            })
            .json<AuthDto>();
          setSession(data);
        },

        async logout() {
          setSession(null);
          await apiClient.post("api/auth/logout", { retry: 0 }).catch(() => {});
        },
      };
    },
    {
      name: AUTH_STORAGE_KEY,
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

  refreshPromise = fetch("api/auth/refresh", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (response) => {
      if (response.ok) {
        const data: AuthDto = await response.json();
        setSession(data);
        return data;
      } else {
        setSession(null);
        return null;
      }
    })
    .finally(() => {
      authStore.setState({ refreshPromise: null });
    });
  authStore.setState({ refreshPromise });

  return refreshPromise;
}

export const { getAccessToken, login, logout, register } = authStore.getState();
