import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="auth-bg h-svh content-center overflow-auto">
      <Outlet />
    </div>
  );
}
