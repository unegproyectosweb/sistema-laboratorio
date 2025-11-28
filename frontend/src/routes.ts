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
  ]),

  layout("./routes/private/layout.tsx", [
    index("./routes/private/index.tsx"),
    route("reservas/:id", "./routes/private/reservas/[id].tsx"),
  ]),
] satisfies RouteConfig;
