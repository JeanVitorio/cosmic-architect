import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, Settings as SettingsIcon, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/$slug")({
  beforeLoad: async ({ params, location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login", search: { redirect: location.href } as any });

    const { data: clinic } = await supabase
      .from("clinics").select("*").eq("slug", params.slug).maybeSingle();
    if (!clinic) throw redirect({ to: "/login" });

    const { data: member } = await supabase
      .from("clinic_members").select("role, active")
      .eq("clinic_id", clinic.id).eq("user_id", session.user.id).maybeSingle();

    if (!member || !member.active) throw redirect({ to: "/login" });
    if (clinic.status !== "active") {
      await supabase.auth.signOut();
      throw redirect({ to: "/login" });
    }
    return { clinic, role: member.role };
  },
  component: AppLayout,
});

function AppLayout() {
  const { clinic } = Route.useRouteContext() as any;
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                {clinic.logo_url ? (
                  <img src={clinic.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
                ) : (
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand text-xs font-bold text-white">
                    {clinic.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-display text-sm font-semibold leading-none">{clinic.name}</div>
                  <div className="text-[11px] text-muted-foreground">@{clinic.slug}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-xs font-semibold text-white">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/app/$slug/configuracoes" params={{ slug: clinic.slug }} search={{ tab: "perfil" } as any}>
                      <UserIcon className="mr-2 h-4 w-4" /> Meu perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/app/$slug/configuracoes" params={{ slug: clinic.slug }}>
                      <Building2 className="mr-2 h-4 w-4" /> Dados da clínica
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/app/$slug/configuracoes" params={{ slug: clinic.slug }} search={{ tab: "equipe" } as any}>
                      <SettingsIcon className="mr-2 h-4 w-4" /> Configurações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await signOut(); navigate({ to: "/login" }); }}>
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl space-y-6 p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
