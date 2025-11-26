import { seemsAuthenticated } from "@/lib/auth";
import { redirect } from "react-router";
import type { Route } from "./+types/layout";

const authMiddleware: Route.ClientMiddlewareFunction = async () => {
  const redirectToLogin = seemsAuthenticated();

  if (!redirectToLogin) {
    throw redirect("/login");
  }
};

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [
  authMiddleware,
];
