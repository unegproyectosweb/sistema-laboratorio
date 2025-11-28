import { getSession, seemsAuthenticated } from "@/lib/auth";
import { redirect } from "react-router";
import type { Route } from "./+types/layout";

const authMiddleware: Route.ClientMiddlewareFunction = async () => {
  const redirectToLogin = seemsAuthenticated();

  if (!redirectToLogin) {
    throw redirect("/login");
  }

  getSession().then(
    (session) => console.log("Session in middleware:", session),
    (error) => console.error("Error getting session in middleware:", error),
  );
};

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [
  authMiddleware,
];
