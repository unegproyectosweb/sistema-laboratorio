import {
  index,
  layout,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  route("logout", "./routes/auth/logout.tsx"),
  layout("./routes/auth/layout.tsx", [
    route("login", "./routes/auth/login.tsx"),
    route("register", "./routes/auth/register.tsx"),
    route(
      "administrador/registrar-administrador",
      "./routes/auth/admin/register.tsx",
    ),
  ]),

  layout("./routes/private/layout.tsx", [
    index("./routes/private/index.tsx"),
    route("reservas", "./routes/private/reservas/index.tsx"),
    route("reservas/:id", "./routes/private/reservas/[id].tsx"),
    route("reservas/nueva", "./routes/private/reservas/nueva.tsx"),
    route("dashboard", "./routes/private/dashboard.tsx"),
    route("config", "./routes/private/config.tsx"),
  ]),
] satisfies RouteConfig;
