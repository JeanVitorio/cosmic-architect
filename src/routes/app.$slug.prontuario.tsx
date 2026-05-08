import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/app/$slug/prontuario")({
  component: ProntuarioPage,
});

function ProntuarioPage() {
  const { clinic } = Route.useRouteContext();
  const { data: records = [] } = useQuery({
    queryKey: ["records", clinic.id],
    queryFn: async () => (await supabase.from("treatment_records")
      .select("*, clients(full_name), procedures(name), professionals(name)")
      .eq("clinic_id", clinic.id).order("performed_at", { ascending: false }).limit(100)).data ?? [],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Prontuário</h1>
        <p className="text-muted-foreground">Histórico de atendimentos da clínica.</p>
      </div>
      {records.length === 0 ? (
        <Card className="p-12 text-center">
          <Camera className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Nenhum registro de prontuário ainda.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between">
                <div>
                  <div className="font-semibold">{r.clients?.full_name}</div>
                  <div className="text-xs text-muted-foreground">{r.procedures?.name} • {r.professionals?.name} • {format(new Date(r.performed_at), "dd/MM/yyyy HH:mm")}</div>
                </div>
              </div>
              {r.notes && <p className="mt-2 text-sm">{r.notes}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
