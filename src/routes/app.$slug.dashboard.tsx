import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Users, Wallet, Megaphone, Sparkles, Package, TrendingUp, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { brl } from "@/lib/slugify";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { format, startOfMonth, subMonths, addDays, isToday, isFuture, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/app/$slug/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { clinic } = Route.useRouteContext() as any;

  const { data } = useQuery({
    queryKey: ["dashboard-v2", clinic.id],
    queryFn: async () => {
      const now = new Date();
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
      const monthStart = startOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const sixMonthsAgo = startOfMonth(subMonths(now, 5));

      const [appts, todayAppts, leads, payments, lastMonthPayments, clients, products, lowStock, allLeads, allProcs, expenses] = await Promise.all([
        supabase.from("appointments").select("id, starts_at, status, clients(full_name), procedures(name), professionals(name, color)")
          .eq("clinic_id", clinic.id).gte("starts_at", new Date().toISOString())
          .order("starts_at").limit(8),
        supabase.from("appointments").select("id", { count: "exact", head: true })
          .eq("clinic_id", clinic.id).gte("starts_at", todayStart.toISOString()).lte("starts_at", todayEnd.toISOString()),
        supabase.from("leads").select("id, kanban_stage, created_at").eq("clinic_id", clinic.id)
          .gte("created_at", monthStart.toISOString()),
        supabase.from("payments").select("amount, paid_at").eq("clinic_id", clinic.id).eq("status", "paid")
          .gte("paid_at", sixMonthsAgo.toISOString()),
        supabase.from("payments").select("amount").eq("clinic_id", clinic.id).eq("status", "paid")
          .gte("paid_at", lastMonthStart.toISOString()).lt("paid_at", monthStart.toISOString()),
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id),
        supabase.from("products").select("id, current_stock, min_stock", { count: "exact" }).eq("clinic_id", clinic.id),
        supabase.from("products").select("id, name, current_stock, min_stock, unit").eq("clinic_id", clinic.id)
          .order("current_stock"),
        supabase.from("leads").select("id, kanban_stage").eq("clinic_id", clinic.id),
        supabase.from("appointments").select("procedure_id, procedures(name, price)")
          .eq("clinic_id", clinic.id).eq("status", "done").gte("starts_at", monthStart.toISOString()),
        supabase.from("expenses").select("amount, date").eq("clinic_id", clinic.id)
          .gte("date", sixMonthsAgo.toISOString().slice(0, 10)),
      ]);

      // Monthly revenue series (6m)
      const months: Record<string, { month: string; revenue: number; expense: number }> = {};
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(now, i);
        const k = format(d, "yyyy-MM");
        months[k] = { month: format(d, "MMM", { locale: ptBR }), revenue: 0, expense: 0 };
      }
      (payments.data ?? []).forEach((p: any) => {
        const k = format(parseISO(p.paid_at), "yyyy-MM");
        if (months[k]) months[k].revenue += Number(p.amount);
      });
      (expenses.data ?? []).forEach((e: any) => {
        const k = format(parseISO(e.date), "yyyy-MM");
        if (months[k]) months[k].expense += Number(e.amount);
      });
      const series = Object.values(months);

      const monthRevenue = (payments.data ?? []).filter((p: any) => parseISO(p.paid_at) >= monthStart)
        .reduce((s: number, p: any) => s + Number(p.amount), 0);
      const lastMonthRevenue = (lastMonthPayments.data ?? []).reduce((s: number, p: any) => s + Number(p.amount), 0);
      const trend = lastMonthRevenue > 0 ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

      // Procedures by revenue
      const procRev: Record<string, { name: string; total: number }> = {};
      (allProcs.data ?? []).forEach((a: any) => {
        const name = a.procedures?.name ?? "—";
        if (!procRev[name]) procRev[name] = { name, total: 0 };
        procRev[name].total += Number(a.procedures?.price ?? 0);
      });
      const topProcs = Object.values(procRev).sort((a, b) => b.total - a.total).slice(0, 5);

      // Lead funnel
      const stages = ["new", "contacted", "scheduled", "converted", "lost"];
      const stageColors = ["#22D3EE", "#FACC15", "#A855F7", "#10B981", "#94A3B8"];
      const funnel = stages.map((s, i) => ({
        name: ["Novo", "Contatado", "Agendado", "Convertido", "Perdido"][i],
        value: (allLeads.data ?? []).filter((l: any) => l.kanban_stage === s).length,
        color: stageColors[i],
      }));

      const conversion = (allLeads.data ?? []).length > 0
        ? ((allLeads.data ?? []).filter((l: any) => l.kanban_stage === "converted").length / (allLeads.data ?? []).length) * 100
        : 0;

      const lowStockItems = (lowStock.data ?? []).filter((p: any) => Number(p.current_stock) <= Number(p.min_stock)).slice(0, 5);

      return {
        todayAppts: todayAppts.count ?? 0,
        upcomingAppts: appts.data ?? [],
        monthLeads: leads.data ?? [],
        monthRevenue, trend, series,
        clients: clients.count ?? 0,
        products: products.count ?? 0,
        lowStockItems,
        topProcs,
        funnel,
        conversion,
      };
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title={`Olá, ${clinic.name?.split(" ")[0] ?? ""}! 👋`}
        description="Visão geral do que acontece na sua clínica."
        actions={
          <Button asChild className="bg-gradient-brand text-white shadow-brand-glow">
            <Link to="/app/$slug/agenda" params={{ slug: clinic.slug }}>
              <CalendarCheck className="mr-2 h-4 w-4" /> Ir para agenda
            </Link>
          </Button>
        } />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Faturamento do mês" value={brl(data?.monthRevenue ?? 0)}
          hint="Pagamentos recebidos"
          icon={Wallet} accent="primary" trend={data?.trend}
          sparkline={data?.series.map(s => s.revenue)} />
        <StatCard label="Agendamentos hoje" value={data?.todayAppts ?? 0}
          icon={CalendarCheck} accent="violet" hint={`${data?.upcomingAppts.length ?? 0} próximos`} />
        <StatCard label="Leads no mês" value={data?.monthLeads.length ?? 0}
          icon={Megaphone} accent="cyan" hint={`${data?.conversion.toFixed(0) ?? 0}% conversão`} />
        <StatCard label="Total de clientes" value={data?.clients ?? 0}
          icon={Users} accent="mint" hint={`${data?.products ?? 0} produtos no estoque`} />
      </div>

      {data && data.lowStockItems.length > 0 && (
        <Card className="border-warning/40 bg-warning/5 p-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-warning/15 text-warning"><AlertTriangle className="h-5 w-5" /></div>
            <div className="flex-1">
              <div className="font-semibold">Atenção: estoque baixo</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {data.lowStockItems.map((p: any) => `${p.name} (${p.current_stock} ${p.unit})`).join(" · ")}
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/app/$slug/estoque" params={{ slug: clinic.slug }}>Ver estoque</Link>
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Faturamento × Despesas (6 meses)</h3>
              <p className="text-xs text-muted-foreground">Visão consolidada do fluxo de caixa.</p>
            </div>
            <Badge variant="outline" className="gap-1"><TrendingUp className="h-3 w-3" /> Tendência</Badge>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.series ?? []}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.22 258)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.55 0.22 258)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.6 0.22 27)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.6 0.22 27)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="currentColor" className="text-muted-foreground text-xs" />
                <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} stroke="currentColor" className="text-muted-foreground text-xs" />
                <Tooltip formatter={(v: any) => brl(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.55 0.22 258)" strokeWidth={2.5} fill="url(#g1)" name="Receita" />
                <Area type="monotone" dataKey="expense" stroke="oklch(0.6 0.22 27)" strokeWidth={2} fill="url(#g2)" name="Despesa" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-lg font-semibold">Funil de leads</h3>
          <p className="text-xs text-muted-foreground">Distribuição por etapa.</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.funnel ?? []} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {(data?.funnel ?? []).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
            {(data?.funnel ?? []).map((f) => (
              <div key={f.name} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ background: f.color }} />
                <span className="text-muted-foreground">{f.name}</span>
                <span className="ml-auto font-semibold">{f.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Próximos agendamentos</h3>
            <Button asChild size="sm" variant="ghost">
              <Link to="/app/$slug/agenda" params={{ slug: clinic.slug }}>Ver tudo <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
          <div className="mt-4 divide-y">
            {(data?.upcomingAppts ?? []).slice(0, 6).map((a: any) => {
              const dt = parseISO(a.starts_at);
              return (
                <div key={a.id} className="flex items-center gap-3 py-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl text-white text-xs font-bold"
                    style={{ background: a.professionals?.color ?? "oklch(0.55 0.22 258)" }}>
                    {format(dt, "HH:mm")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{a.clients?.full_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{a.procedures?.name} · {a.professionals?.name}</div>
                  </div>
                  <Badge variant={isToday(dt) ? "default" : "outline"} className="text-[10px]">
                    {isToday(dt) ? "Hoje" : format(dt, "dd/MM")}
                  </Badge>
                </div>
              );
            })}
            {(data?.upcomingAppts ?? []).length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">Sem agendamentos futuros.</div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Top procedimentos do mês</h3>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topProcs ?? []} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} className="text-xs" />
                <YAxis type="category" dataKey="name" width={120} className="text-xs" />
                <Tooltip formatter={(v: any) => brl(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="total" radius={[0, 8, 8, 0]} fill="oklch(0.62 0.22 305)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
