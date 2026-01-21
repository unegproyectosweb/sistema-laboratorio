import ky, { HTTPError, isHTTPError, isTimeoutError } from "ky";
import { getAccessToken, refreshSession } from "./auth";
import type { UseFormSetError } from "react-hook-form";
import type z from "zod";

export const apiClient = ky.create({
  prefixUrl: "/api",
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
    methods: [
      "get",
      "put",
      "head",
      "delete",
      "options",
      "trace",
      "post",
      "patch",
    ],
  },
});

export async function setErrorFromServer(
  setError: UseFormSetError<any>,
  error: unknown,
) {
  if (isHTTPError(error)) {
    const response = error.response;

    if (response.status === 500) {
      console.error("Server error:", await response.text());
      setError("root", {
        message: "Error del servidor. Por favor, inténtalo de nuevo más tarde.",
      });
      return;
    }

    const data = await error.response.json<{
      message?: string | string[];
      errors?: z.core.$ZodIssue[];
    }>();
    if (data.errors) {
      for (const issue of data.errors) {
        if (issue.path && issue.path.length > 0) {
          setError(issue.path.join("."), { message: issue.message });
        } else {
          setError("root", { message: issue.message });
        }
      }
    } else if (typeof data.message === "string") {
      setError("root", { message: data.message });
    } else if (Array.isArray(data.message)) {
      setError("root", { message: data.message[0] });
    }
  } else if (isTimeoutError(error)) {
    setError("root", {
      message:
        "La solicitud ha excedido el tiempo de espera. Por favor, inténtalo de nuevo.",
    });
  } else {
    setError("root", { message: String(error) });
  }
}

export async function extractErrorMessages(error: unknown): Promise<string[]> {
  if (isHTTPError(error)) {
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
  } else if (isTimeoutError(error)) {
    return [
      "La solicitud ha excedido el tiempo de espera. Por favor, inténtalo de nuevo.",
    ];
  }

  return [String(error)];
}
