import { Link, useParams, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Calendar, Users, Sparkles, Megaphone,
  ClipboardList, Wallet, BarChart3, Settings,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { UnaLogo } from "@/components/una-logo";

const menu = [
  { title: "Dashboard", url: "dashboard", icon: LayoutDashboard },
  { title: "Agenda", url: "agenda", icon: Calendar },
  { title: "Clientes", url: "clientes", icon: Users },
  { title: "Procedimentos", url: "procedimentos", icon: Sparkles },
  { title: "Captação", url: "leads", icon: Megaphone },
  { title: "Prontuário", url: "prontuario", icon: ClipboardList },
  { title: "Financeiro", url: "financeiro", icon: Wallet },
  { title: "Relatórios", url: "relatorios", icon: BarChart3 },
  { title: "Configurações", url: "configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { slug } = useParams({ strict: false }) as { slug: string };
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b py-4">
        <div className="flex items-center justify-center px-2">
          <UnaLogo withWordmark={!collapsed} size={collapsed ? 28 : 32} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => {
                const url = `/app/${slug}/${item.url}`;
                const active = path.startsWith(url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-3 text-xs text-muted-foreground">
        {!collapsed && <span>UNA v1.0</span>}
      </SidebarFooter>
    </Sidebar>
  );
}
