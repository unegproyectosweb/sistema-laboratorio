import {
  index,
  layout,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  layout("./routes/auth/layout.tsx", [
    route("logout", "./routes/auth/logout.tsx"),
    route("login", "./routes/auth/login.tsx"),
    route("register", "./routes/auth/register.tsx"),
  ]),

  layout("./routes/private/layout.tsx", [index("./routes/private/index.tsx")]),
] satisfies RouteConfig;
