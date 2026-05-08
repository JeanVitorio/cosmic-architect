import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar as CalIcon } from "lucide-react";
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/app/$slug/agenda")({
  component: AgendaPage,
});

const schema = z.object({
  client_id: z.string().uuid(),
  professional_id: z.string().uuid(),
  procedure_id: z.string().uuid().optional(),
  starts_at: z.string(),
  duration_min: z.coerce.number().int().min(15).max(600),
});

function AgendaPage() {
  const { clinic } = Route.useRouteContext();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date());

  const weekStart = startOfWeek(selectedDay, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", clinic.id, weekStart.toISOString()],
    queryFn: async () => {
      const start = weekStart;
      const end = addDays(weekStart, 7);
      const { data, error } = await supabase.from("appointments")
        .select("*, clients(full_name), professionals(name, color), procedures(name)")
        .eq("clinic_id", clinic.id)
        .gte("starts_at", start.toISOString()).lt("starts_at", end.toISOString())
        .order("starts_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-list", clinic.id],
    queryFn: async () => (await supabase.from("clients").select("id, full_name").eq("clinic_id", clinic.id).order("full_name")).data ?? [],
  });
  const { data: professionals = [] } = useQuery({
    queryKey: ["professionals-list", clinic.id],
    queryFn: async () => (await supabase.from("professionals").select("id, name").eq("clinic_id", clinic.id).eq("active", true)).data ?? [],
  });
  const { data: procedures = [] } = useQuery({
    queryKey: ["procedures-list", clinic.id],
    queryFn: async () => (await supabase.from("procedures").select("id, name, duration_min").eq("clinic_id", clinic.id).eq("active", true)).data ?? [],
  });

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<any>({ resolver: zodResolver(schema) });

  const create = useMutation({
    mutationFn: async (v: any) => {
      const start = new Date(v.starts_at);
      const end = new Date(start.getTime() + v.duration_min * 60000);
      const { error } = await supabase.from("appointments").insert({
        clinic_id: clinic.id,
        client_id: v.client_id,
        professional_id: v.professional_id,
        procedure_id: v.procedure_id || null,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        status: "scheduled",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Agendamento criado");
      qc.invalidateQueries({ queryKey: ["appointments"] });
      setOpen(false); reset();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">Calendário semanal de agendamentos.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-brand text-white"><Plus className="mr-1 h-4 w-4" /> Agendar</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo agendamento</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit((v) => create.mutate(v))} className="space-y-4">
              <div>
                <Label>Cliente</Label>
                <Select onValueChange={(v) => setValue("client_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
                </Select>
                {errors.client_id && <p className="mt-1 text-xs text-destructive">Obrigatório</p>}
              </div>
              <div>
                <Label>Profissional</Label>
                <Select onValueChange={(v) => setValue("professional_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{professionals.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
                {errors.professional_id && <p className="mt-1 text-xs text-destructive">Obrigatório</p>}
              </div>
              <div>
                <Label>Procedimento</Label>
                <Select onValueChange={(v) => {
                  setValue("procedure_id", v);
                  const proc = procedures.find((p) => p.id === v);
                  if (proc) setValue("duration_min", proc.duration_min);
                }}>
                  <SelectTrigger><SelectValue placeholder="Opcional..." /></SelectTrigger>
                  <SelectContent>{procedures.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Data e hora</Label>
                  <Input type="datetime-local" {...register("starts_at")} />
                </div>
                <div>
                  <Label>Duração (min)</Label>
                  <Input type="number" {...register("duration_min")} defaultValue={60} />
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-brand text-white" disabled={create.isPending}>
                {create.isPending ? "Salvando..." : "Agendar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setSelectedDay(addDays(selectedDay, -7))}>‹ Semana anterior</Button>
        <span className="font-medium">{format(weekStart, "dd MMM", { locale: ptBR })} – {format(addDays(weekStart, 6), "dd MMM yyyy", { locale: ptBR })}</span>
        <Button variant="outline" size="sm" onClick={() => setSelectedDay(addDays(selectedDay, 7))}>Próxima ›</Button>
        <Button variant="ghost" size="sm" onClick={() => setSelectedDay(new Date())}>Hoje</Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayAppts = appointments.filter((a) => isSameDay(new Date(a.starts_at), day));
          return (
            <Card key={day.toISOString()} className="min-h-64 p-3">
              <div className="mb-2 text-center">
                <div className="text-xs uppercase text-muted-foreground">{format(day, "EEE", { locale: ptBR })}</div>
                <div className={`mx-auto mt-1 grid h-8 w-8 place-items-center rounded-full text-sm font-semibold ${isSameDay(day, new Date()) ? "bg-gradient-brand text-white" : ""}`}>
                  {format(day, "dd")}
                </div>
              </div>
              <div className="space-y-1">
                {dayAppts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground"><CalIcon className="mx-auto mb-1 h-4 w-4 opacity-50" />Livre</div>
                ) : dayAppts.map((a: any) => (
                  <div key={a.id} className="rounded-md border bg-gradient-brand-soft p-2 text-xs">
                    <div className="font-semibold">{format(new Date(a.starts_at), "HH:mm")}</div>
                    <div className="truncate">{a.clients?.full_name}</div>
                    <div className="truncate text-muted-foreground">{a.procedures?.name ?? "—"}</div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
