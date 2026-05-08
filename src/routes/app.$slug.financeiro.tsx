import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brl } from "@/lib/slugify";
import { format } from "date-fns";

export const Route = createFileRoute("/app/$slug/financeiro")({
  component: FinancePage,
});

function FinancePage() {
  const { clinic } = Route.useRouteContext();

  const { data: payments = [] } = useQuery({
    queryKey: ["payments", clinic.id],
    queryFn: async () => (await supabase.from("payments")
      .select("*, clients(full_name)").eq("clinic_id", clinic.id)
      .order("created_at", { ascending: false }).limit(50)).data ?? [],
  });

  const { data: packages = [] } = useQuery({
    queryKey: ["packages", clinic.id],
    queryFn: async () => (await supabase.from("packages")
      .select("*, clients(full_name), procedures(name)").eq("clinic_id", clinic.id)
      .order("created_at", { ascending: false }).limit(50)).data ?? [],
  });

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Financeiro</h1>
        <p className="text-muted-foreground">Pacotes, sessões e pagamentos.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Recebido</div>
          <div className="mt-2 font-display text-2xl font-bold text-success">{brl(totalPaid)}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">A receber</div>
          <div className="mt-2 font-display text-2xl font-bold text-warning">{brl(totalPending)}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Pacotes ativos</div>
          <div className="mt-2 font-display text-2xl font-bold">{packages.filter(p => p.status === "active").length}</div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Últimos pagamentos</h2>
        {payments.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Nenhum pagamento registrado.</p>
        ) : (
          <div className="mt-4 divide-y">
            {payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{p.clients?.full_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(p.created_at), "dd/MM/yyyy")} • {p.method ?? "—"}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={p.status === "paid" ? "default" : "outline"}>{p.status}</Badge>
                  <span className="font-display font-bold">{brl(p.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Pacotes</h2>
        {packages.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Nenhum pacote ativo.</p>
        ) : (
          <div className="mt-4 divide-y">
            {packages.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{p.clients?.full_name}</div>
                  <div className="text-xs text-muted-foreground">{p.procedures?.name} • {p.used_sessions}/{p.total_sessions} sessões</div>
                </div>
                <span className="font-display font-bold">{brl(p.price)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
