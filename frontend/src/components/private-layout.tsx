import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useUser } from "@/lib/auth";
import { getInitials } from "@/lib/utils";
import AppSidebar, { type NavSection } from "./app-sidebar";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Toggle } from "./ui/toggle";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export interface PrivateLayoutProps {
  sections: NavSection[];
  children: React.ReactNode;
}

export default function PrivateLayout({
  sections,
  children,
}: PrivateLayoutProps) {
  const { user } = useUser();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const toggleTheme = () =>
    setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <SidebarProvider>
      <AppSidebar sections={sections} />

      <SidebarInset className="h-screen">
        <header className="flex h-14 items-center gap-3 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <span className="grow"></span>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  aria-label="Cambiar tema"
                  size="sm"
                  variant="rounded"
                  onPressedChange={() => toggleTheme()}
                  pressed={resolvedTheme === "dark"}
                >
                  {resolvedTheme === "dark" ? (
                    <Moon className="size-4" />
                  ) : (
                    <Sun className="size-4" />
                  )}
                </Toggle>
              </TooltipTrigger>
              <TooltipContent collisionPadding={6}>
                {theme === "dark" ? "Tema oscuro" : "Tema claro"}
              </TooltipContent>
            </Tooltip>

            {user && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="md:size-10">
                    <AvatarFallback className="bg-slate-900 font-bold text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent collisionPadding={6}>
                  {user.name}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
