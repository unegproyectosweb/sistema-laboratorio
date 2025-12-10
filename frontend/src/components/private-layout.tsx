import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useUser } from "@/lib/auth";
import AppSidebar, { type NavSection } from "./app-sidebar";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export interface PrivateLayoutProps {
  sections: NavSection[];
  children: React.ReactNode;
}

export default function PrivateLayout({
  sections,
  children,
}: PrivateLayoutProps) {
  const { user } = useUser();
  return (
    <SidebarProvider>
      <AppSidebar sections={sections} />

      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <span className="grow"></span>

          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="md:size-10">
                  <AvatarFallback className="bg-slate-900 font-bold text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent collisionPadding={6}>{user.name}</TooltipContent>
            </Tooltip>
          )}
        </header>

        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function getInitials(name: string) {
  const regex = /\b\w/g;
  const initials = name.match(regex)?.join("").toUpperCase() || "";
  return initials.slice(0, 2);
}
