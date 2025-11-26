import ky, { HTTPError } from "ky";
import { getAccessToken, refreshSession } from "./auth";

export const apiClient = ky.create({
  hooks: {
    beforeRequest: [
      (request) => {
        const token = getAccessToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    beforeRetry: [
      async ({ error }) => {
        if (error instanceof HTTPError) {
          if (error.response.status === 401) {
            await refreshSession();
          }
        }
      },
    ],
  },
  retry: {
    limit: 1,
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
