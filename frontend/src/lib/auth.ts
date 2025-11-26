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

interface AuthState {
  isRefreshing: boolean;
  accessToken: string | null;
  user: UserData | null;
}

const AUTH_STORAGE_KEY = "auth";

const authStore = createStore<AuthState>()(
  persist(
    (_set) => ({
      isRefreshing: false,
      accessToken: null,
      user: null,
    }),
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

let refreshPromise: Promise<AuthDto | null> | null = null;

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
  if (refreshPromise) return refreshPromise;

  authStore.setState({ isRefreshing: true });
  refreshPromise = apiClient
    .post("/api/auth/refresh", {
      retry: 0,
      throwHttpErrors: false,
    })
    .then(async (response) => {
      if (response.ok) {
        const data = await response.json<AuthDto>();
        setSession(data);
        return data;
      } else {
        setSession(null);
        return null;
      }
    })
    .finally(() => {
      refreshPromise = null;
      authStore.setState({ isRefreshing: false });
    });

  return refreshPromise;
}

export function getAccessToken(): string | null {
  const state = authStore.getState();
  return state.accessToken || null;
}

export async function login(values: { username: string; password: string }) {
  const data = await apiClient
    .post("api/auth/login", { json: values, retry: 0 })
    .json<AuthDto>();

  setSession(data);
}

export async function register(values: {
  username: string;
  name: string;
  email: string;
  password: string;
}) {
  await apiClient.post("api/auth/register", {
    json: values,
    retry: 0,
  });
}

export async function logout() {
  setSession(null);
  await apiClient.post("api/auth/logout", { retry: 0 }).catch(() => {});
}
