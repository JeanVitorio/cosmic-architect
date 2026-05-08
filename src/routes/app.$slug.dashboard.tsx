import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { CalendarCheck, Users, Wallet, Megaphone, TrendingUp } from "lucide-react";
import { brl } from "@/lib/slugify";

export const Route = createFileRoute("/app/$slug/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { clinic } = Route.useRouteContext();

  const { data: stats } = useQuery({
    queryKey: ["dashboard", clinic.id],
    queryFn: async () => {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

      const [appts, leads, payments, clients] = await Promise.all([
        supabase.from("appointments").select("id", { count: "exact", head: true })
          .eq("clinic_id", clinic.id).gte("starts_at", todayStart.toISOString()).lte("starts_at", todayEnd.toISOString()),
        supabase.from("leads").select("id", { count: "exact", head: true })
          .eq("clinic_id", clinic.id).gte("created_at", monthStart.toISOString()),
        supabase.from("payments").select("amount").eq("clinic_id", clinic.id).eq("status", "paid")
          .gte("paid_at", monthStart.toISOString()),
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("clinic_id", clinic.id),
      ]);

      const revenue = (payments.data ?? []).reduce((s, p) => s + Number(p.amount), 0);
      return {
        todayAppts: appts.count ?? 0,
        monthLeads: leads.count ?? 0,
        revenue,
        clients: clients.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Agendamentos hoje", value: stats?.todayAppts ?? "—", icon: CalendarCheck },
    { label: "Novos leads (mês)", value: stats?.monthLeads ?? "—", icon: Megaphone },
    { label: "Faturamento (mês)", value: stats ? brl(stats.revenue) : "—", icon: Wallet },
    { label: "Total de clientes", value: stats?.clients ?? "—", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Olá! 👋</h1>
        <p className="text-muted-foreground">Visão geral da sua clínica.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{c.label}</div>
                <div className="mt-2 font-display text-3xl font-bold">{c.value}</div>
              </div>
              <div className="rounded-xl bg-gradient-brand-soft p-3">
                <c.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-8 text-center">
        <TrendingUp className="mx-auto h-10 w-10 text-primary" />
        <h3 className="mt-4 font-display text-xl font-semibold">Tudo pronto para começar</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Cadastre clientes, procedimentos e profissionais para começar a usar todos os recursos.
        </p>
      </Card>
    </div>
  );
}
