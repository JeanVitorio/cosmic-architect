import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { brl } from "@/lib/slugify";

export const Route = createFileRoute("/app/$slug/relatorios")({
  component: ReportsPage,
});

function ReportsPage() {
  const { clinic } = Route.useRouteContext();
  const { data } = useQuery({
    queryKey: ["reports", clinic.id],
    queryFn: async () => {
      const since = new Date(); since.setMonth(since.getMonth() - 5); since.setDate(1); since.setHours(0,0,0,0);
      const { data: pays } = await supabase.from("payments").select("amount, paid_at, status")
        .eq("clinic_id", clinic.id).eq("status", "paid").gte("paid_at", since.toISOString());
      const buckets: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i); d.setDate(1);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        buckets[k] = 0;
      }
      (pays ?? []).forEach((p: any) => {
        const d = new Date(p.paid_at); const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (k in buckets) buckets[k] += Number(p.amount);
      });
      return Object.entries(buckets).map(([month, value]) => ({ month, value }));
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">Faturamento dos últimos 6 meses.</p>
      </div>
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Faturamento mensal</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data ?? []}>
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => brl(v)} width={80} />
              <Tooltip formatter={(v: any) => brl(v)} />
              <Bar dataKey="value" fill="oklch(0.55 0.22 255)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
