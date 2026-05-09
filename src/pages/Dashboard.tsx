import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useClinic } from "@/store/ClinicStore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays, Users, Wallet, TrendingUp, Inbox, AlertTriangle,
  Cake, Sparkles, ArrowUpRight, Clock, CircleDollarSign, Activity,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { PeriodFilter, type Period, inPeriod } from "@/components/PeriodFilter";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Dashboard() {
  const { clients, procedures, appointments, leads, finance, inventory, settings } = useClinic();
  const [period, setPeriod] = useState<Period>({ preset: "month" });

  const stats = useMemo(() => {
    const apsInPeriod = appointments.filter(a => inPeriod(a.start_at, period));
    const finInPeriod = finance.filter(f => inPeriod(f.date, period));
    const revenue = finInPeriod.filter(f => f.kind === "income").reduce((s, f) => s + f.amount, 0);
    const expense = finInPeriod.filter(f => f.kind === "expense").reduce((s, f) => s + f.amount, 0);
    const done = apsInPeriod.filter(a => a.status === "done").length;
    const futureConfirmed = appointments.filter(a => new Date(a.start_at) > new Date() && (a.status === "confirmed" || a.status === "scheduled")).length;
    const newLeads = leads.filter(l => inPeriod(l.created_at, period)).length;
    const conversion = leads.length ? Math.round((leads.filter(l => l.stage === "converted").length / leads.length) * 100) : 0;
    return { revenue, expense, profit: revenue - expense, done, futureConfirmed, newLeads, conversion };
  }, [appointments, finance, leads, period]);

  const revenueByMonth = useMemo(() => {
    const map = new Map<string, { month: string; receita: number; despesa: number }>();
    finance.forEach(f => {
      const d = new Date(f.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-BR", { month: "short" });
      const cur = map.get(key) ?? { month: label, receita: 0, despesa: 0 };
      if (f.kind === "income") cur.receita += f.amount;
      else cur.despesa += f.amount;
      map.set(key, cur);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([, v]) => v);
  }, [finance]);

  const topProcedures = useMemo(() => {
    const counts = new Map<string, number>();
    appointments.filter(a => a.status === "done").forEach(a => {
      counts.set(a.procedure_id, (counts.get(a.procedure_id) ?? 0) + (a.price_charged ?? 0));
    });
    return Array.from(counts.entries())
      .map(([pid, total]) => ({ name: procedures.find(p => p.id === pid)?.name ?? "—", total }))
      .sort((a, b) => b.total - a.total).slice(0, 5);
  }, [appointments, procedures]);

  const leadFunnel = useMemo(() => {
    const labels = { new: "Novos", contacted: "Contatados", scheduled: "Agendados", showed: "Compareceram", converted: "Convertidos" };
    return Object.entries(labels).map(([k, label]) => ({
      name: label,
      value: leads.filter(l => l.stage === k).length,
    }));
  }, [leads]);

  const todayAppointments = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    return appointments
      .filter(a => { const d = new Date(a.start_at); return d >= today && d < tomorrow; })
      .sort((a, b) => a.start_at.localeCompare(b.start_at));
  }, [appointments]);

  const hotLeads = useMemo(() => leads.filter(l => l.stage === "scheduled" || l.stage === "contacted").slice(0, 5), [leads]);

  const criticalStock = useMemo(() => inventory.filter(i => i.qty_on_hand <= i.qty_min).slice(0, 5), [inventory]);

  const birthdays = useMemo(() => {
    const now = new Date();
    return clients.filter(c => {
      if (!c.birthdate) return false;
      const d = new Date(c.birthdate);
      return d.getMonth() === now.getMonth();
    }).slice(0, 5);
  }, [clients]);

  const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--gold))", "hsl(var(--success))", "hsl(var(--primary-glow))"];

  return (
    <div className="max-w-[1500px] mx-auto space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl gradient-mesh border border-border p-6 lg:p-8 animate-fade-up">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> {settings.name}
            </div>
            <h1 className="font-serif-display text-3xl lg:text-4xl mb-1">
              Bom dia, <span className="text-gradient-hero">cuidemos da sua clínica</span>
            </h1>
            <p className="text-muted-foreground">{todayAppointments.length} compromissos hoje · {stats.futureConfirmed} confirmados próximos</p>
          </div>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Receita", value: brl(stats.revenue), icon: CircleDollarSign, gradient: "gradient-hero", trend: "+18%" },
          { label: "Lucro líquido", value: brl(stats.profit), icon: TrendingUp, gradient: "gradient-mint", trend: "+12%" },
          { label: "Atendimentos", value: stats.done, icon: Activity, gradient: "gradient-rose", trend: `${stats.futureConfirmed} agendados` },
          { label: "Novos leads", value: stats.newLeads, icon: Inbox, gradient: "gradient-sunrise", trend: `${stats.conversion}% conversão` },
        ].map((k, i) => (
          <Card key={i} className="p-5 hover-lift border-border/60 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${k.gradient} flex items-center justify-center shadow-soft`}>
                <k.icon className="w-5 h-5 text-white" />
              </div>
              <Badge variant="secondary" className="text-[10px] gap-1"><ArrowUpRight className="w-3 h-3" />{k.trend}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className="text-2xl font-bold tracking-tight">{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-6 border-border/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg">Receita vs Despesa</h3>
              <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
            </div>
            <Badge variant="outline" className="gap-1 text-success border-success/40"><TrendingUp className="w-3 h-3" />Saudável</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByMonth}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} formatter={(v: number) => brl(v)} />
                <Area type="monotone" dataKey="receita" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#rev)" />
                <Area type="monotone" dataKey="despesa" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#exp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-border/60">
          <h3 className="font-display font-semibold text-lg mb-1">Funil de Leads</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribuição por estágio</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadFunnel} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {leadFunnel.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {leadFunnel.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {s.name}
                </span>
                <span className="font-semibold tabular-nums">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's agenda */}
        <Card className="p-6 border-border/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" />Hoje</h3>
            <Button asChild variant="ghost" size="sm" className="text-xs"><Link to="/calendar">Ver agenda<ArrowUpRight className="w-3 h-3 ml-1" /></Link></Button>
          </div>
          <div className="space-y-2">
            {todayAppointments.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Nenhum compromisso hoje.</p>}
            {todayAppointments.map(a => {
              const c = clients.find(cl => cl.id === a.client_id);
              const p = procedures.find(pr => pr.id === a.procedure_id);
              const time = new Date(a.start_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition group">
                  <div className="text-center shrink-0 w-12">
                    <p className="text-sm font-bold tabular-nums">{time}</p>
                    <p className="text-[10px] text-muted-foreground">{a.duration_min}min</p>
                  </div>
                  <div className="w-1 h-10 rounded-full gradient-hero" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p?.name}</p>
                  </div>
                  <Badge variant={a.status === "done" ? "secondary" : "outline"} className="text-[10px]">
                    {a.status === "done" ? "Realizado" : a.status === "confirmed" ? "Confirmado" : "Agendado"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Hot leads */}
        <Card className="p-6 border-border/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg flex items-center gap-2"><Inbox className="w-4 h-4 text-accent" />Leads quentes</h3>
            <Button asChild variant="ghost" size="sm" className="text-xs"><Link to="/leads">Ver todos<ArrowUpRight className="w-3 h-3 ml-1" /></Link></Button>
          </div>
          <div className="space-y-2">
            {hotLeads.map(l => {
              const p = procedures.find(pr => pr.id === l.procedure_interest_id);
              return (
                <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition">
                  <div className="w-9 h-9 rounded-full gradient-rose flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {l.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{l.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p?.name ?? "Avaliação"} · {l.source}</p>
                  </div>
                  <Badge className="text-[10px] capitalize" variant={l.stage === "scheduled" ? "default" : "secondary"}>
                    {l.stage === "scheduled" ? "Agendado" : "Contatado"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Critical stock + Birthdays */}
        <div className="space-y-4">
          <Card className="p-6 border-border/60">
            <h3 className="font-display font-semibold text-base flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-warning" />Estoque crítico
            </h3>
            <div className="space-y-2">
              {criticalStock.length === 0 && <p className="text-xs text-muted-foreground">Tudo em ordem ✨</p>}
              {criticalStock.map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{p.name}</span>
                  <Badge variant="destructive" className="text-[10px] tabular-nums">{p.qty_on_hand}/{p.qty_min}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-border/60">
            <h3 className="font-display font-semibold text-base flex items-center gap-2 mb-3">
              <Cake className="w-4 h-4 text-accent" />Aniversariantes do mês
            </h3>
            <div className="space-y-2">
              {birthdays.length === 0 && <p className="text-xs text-muted-foreground">Sem aniversariantes este mês.</p>}
              {birthdays.map(c => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {c.birthdate && new Date(c.birthdate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Top procedures */}
      <Card className="p-6 border-border/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-lg">Procedimentos que mais faturam</h3>
            <p className="text-xs text-muted-foreground">Receita acumulada</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProcedures} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={180} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} formatter={(v: number) => brl(v)} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
