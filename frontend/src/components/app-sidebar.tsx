import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import { Fragment } from "react";
import { Form, NavLink } from "react-router";

interface AppSidebarProps {
  sections: NavSection[];
}

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

function SidebarNavItem({ item }: { item: NavItem }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={item.title} asChild>
        <NavLink to={item.href} end={item.href === "/"}>
          <item.icon className="text-sidebar-foreground/70" />
          <span>{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function AppSidebar({ sections }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader
        className={cn(
          "max-h-14 transition-all duration-300",
          "group-data-[collapsible=icon]:max-h-6 group-data-[collapsible=icon]:py-0 group-data-[collapsible=icon]:opacity-0",
        )}
      >
        <div className="text-sidebar-foreground/80 w overflow-clip px-2 pt-2 text-xl font-bold uppercase">
          Menú
        </div>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section, index) => (
          <Fragment key={section.label}>
            <SidebarGroup>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarNavItem key={item.title} item={item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {index < sections.length - 1 ? (
              <SidebarSeparator orientation="horizontal" className="w-auto!" />
            ) : null}
          </Fragment>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <Form
          method="post"
          action="/logout"
          id="logout-form"
          className="contents"
        >
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Cerrar sesión">
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </Form>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
