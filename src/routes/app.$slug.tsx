import { createFileRoute, Outlet, redirect, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/$slug")({
  beforeLoad: async ({ params, location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login", search: { redirect: location.href } as any });

    const { data: clinic } = await supabase
      .from("clinics").select("id, status, name").eq("slug", params.slug).maybeSingle();
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
  const { clinic } = Route.useRouteContext();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <div className="font-display text-sm font-semibold">{clinic.name}</div>
                <div className="text-xs text-muted-foreground">@{(clinic as any).slug ?? ""}</div>
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
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem><UserIcon className="mr-2 h-4 w-4" /> Meu perfil</DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => { await signOut(); navigate({ to: "/login" }); }}>
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
