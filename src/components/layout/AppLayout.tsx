import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, Users, Sparkles as Procedures, FileText, Inbox,
  Wallet, Boxes, BarChart3, Settings as SettingsIcon, Search, Moon, Sun, LogOut,
  Sparkle, Globe, UserCircle2, Sparkles,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useApp } from "@/store/AppStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import { NotificationsBell } from "@/components/NotificationsBell";
import { useClinic } from "@/store/ClinicStore";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/calendar", label: "Agenda", icon: CalendarDays },
  { to: "/leads", label: "Leads", icon: Inbox },
  { to: "/clients", label: "Clientes", icon: Users },
  { to: "/procedures", label: "Procedimentos", icon: Procedures },
  { to: "/forms", label: "Formulários", icon: FileText },
  { to: "/inventory", label: "Estoque", icon: Boxes },
  { to: "/finance", label: "Financeiro", icon: Wallet },
  { to: "/reports", label: "Relatórios", icon: BarChart3 },
  { to: "/catalog", label: "Catálogo Público", icon: Globe },
  { to: "/settings", label: "Configurações", icon: SettingsIcon },
];

export function AppLayout() {
  const { theme, toggle } = useTheme();
  const { currentUser } = useApp();
  const { settings } = useClinic();
  const { logout } = useAuth();
  const { query, setQuery } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();

  const showSearch = location.pathname !== "/";

  function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) navigate("/leads");
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-64 border-r border-sidebar-border bg-sidebar shrink-0 flex flex-col py-5 px-3 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-3 mb-6">
          <div className="w-10 h-10 rounded-2xl gradient-hero flex items-center justify-center shadow-glow">
            <Sparkle className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif-display text-lg leading-none text-sidebar-foreground">Lumière</h1>
            <p className="text-[10px] text-muted-foreground mt-1 truncate">{settings.name}</p>
          </div>
        </div>

        <nav className="space-y-0.5 flex-1 overflow-y-auto scrollbar-thin -mx-1 px-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-3 pt-3 border-t border-sidebar-border">
          <div className="rounded-xl gradient-hero p-3 text-white shadow-glow">
            <div className="flex items-center gap-2 mb-1">
              <Sparkle className="w-4 h-4" />
              <span className="text-xs font-semibold">Modo Demonstração</span>
            </div>
            <p className="text-[11px] text-white/80 leading-snug">Dados pré-populados para você explorar.</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-background/70 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between px-6 gap-4">
          <div className="flex-1 max-w-md">
            {showSearch && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleSearchKey}
                  placeholder="Buscar clientes, leads, procedimentos…"
                  className="w-full h-10 bg-muted/50 border border-border rounded-xl pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden md:inline-flex gap-1 border-primary/40 text-primary bg-primary/5">
              <Sparkles className="w-3 h-3" /> Plano Premium
            </Badge>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema" className="rounded-xl">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <NotificationsBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-2xl gradient-hero flex items-center justify-center text-white text-xs font-bold shadow-glow hover:scale-105 transition">
                  {currentUser.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{currentUser.name}</span>
                    <span className="text-xs text-muted-foreground font-normal">{currentUser.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings?tab=profile")} className="gap-2">
                  <UserCircle2 className="w-4 h-4" /> Meu perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")} className="gap-2">
                  <SettingsIcon className="w-4 h-4" /> Configurações da clínica
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="gap-2 text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main key={location.pathname} className="flex-1 p-6 lg:p-8 animate-fade-in min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// import alias for the badge sparkle (different size from sidebar)
import { Sparkles } from "lucide-react";
