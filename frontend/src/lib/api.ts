import ky, { HTTPError } from "ky";
import { getAccessToken, refreshSession } from "./auth";

export const apiClient = ky.create({
  credentials: "include",
  headers: {
    Accept: "application/json",
  },
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await getAccessToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    beforeRetry: [
      async ({ error, retryCount }) => {
        if (error instanceof HTTPError) {
          if (error.response.status === 401) {
            if (retryCount > 1) {
              console.warn("Max retries reached. Redirecting to login.");
              window.location.href = "/login";
              return;
            }
            await refreshSession();
          }
        }
      },
    ],
  },
  retry: {
    limit: 2,
    statusCodes: [401],
  },
});

export async function extractErrorMessages(error: unknown): Promise<string[]> {
  if (error instanceof HTTPError) {
    const response = error.response;

    if (response.status === 500) {
      console.error("Server error:", await response.text());
      return ["Error del servidor. Por favor, inténtalo de nuevo más tarde."];
    }

    const data = await error.response.json<{ message?: string | string[] }>();
    if (typeof data.message === "string") {
      return [data.message];
    } else if (Array.isArray(data.message)) {
      return data.message;
    }
  }

  return [String(error)];
}
