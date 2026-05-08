import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/app/$slug/configuracoes")({
  component: SettingsPage,
});

function SettingsPage() {
  const { clinic } = Route.useRouteContext();
  const qc = useQueryClient();

  const { data: pros = [] } = useQuery({
    queryKey: ["professionals", clinic.id],
    queryFn: async () => (await supabase.from("professionals").select("*").eq("clinic_id", clinic.id).order("name")).data ?? [],
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms", clinic.id],
    queryFn: async () => (await supabase.from("rooms").select("*").eq("clinic_id", clinic.id).order("name")).data ?? [],
  });

  const proForm = useForm<{ name: string }>();
  const roomForm = useForm<{ name: string }>();

  const addPro = useMutation({
    mutationFn: async (v: { name: string }) => {
      const { error } = await supabase.from("professionals").insert({ clinic_id: clinic.id, name: v.name });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["professionals"] }); proForm.reset(); toast.success("Profissional adicionado"); },
    onError: (e: any) => toast.error(e.message),
  });

  const addRoom = useMutation({
    mutationFn: async (v: { name: string }) => {
      const { error } = await supabase.from("rooms").insert({ clinic_id: clinic.id, name: v.name });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rooms"] }); roomForm.reset(); toast.success("Sala adicionada"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Profissionais, salas e dados da clínica.</p>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Dados da clínica</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><Label>Nome</Label><Input defaultValue={clinic.name} disabled /></div>
          <div><Label>Slug</Label><Input defaultValue={(clinic as any).slug ?? ""} disabled /></div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Profissionais</h2>
        <form onSubmit={proForm.handleSubmit((v) => addPro.mutate(v))} className="mt-4 flex gap-2">
          <Input placeholder="Nome do profissional" {...proForm.register("name", { required: true })} />
          <Button type="submit"><Plus className="mr-1 h-4 w-4" /> Adicionar</Button>
        </form>
        <div className="mt-4 divide-y">
          {pros.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color ?? "#22D3EE" }} />
                <span className="font-medium">{p.name}</span>
              </div>
            </div>
          ))}
          {pros.length === 0 && <p className="py-4 text-sm text-muted-foreground">Nenhum profissional cadastrado.</p>}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Salas</h2>
        <form onSubmit={roomForm.handleSubmit((v) => addRoom.mutate(v))} className="mt-4 flex gap-2">
          <Input placeholder="Nome da sala" {...roomForm.register("name", { required: true })} />
          <Button type="submit"><Plus className="mr-1 h-4 w-4" /> Adicionar</Button>
        </form>
        <div className="mt-4 divide-y">
          {rooms.map((r) => (<div key={r.id} className="py-3">{r.name}</div>))}
          {rooms.length === 0 && <p className="py-4 text-sm text-muted-foreground">Nenhuma sala cadastrada.</p>}
        </div>
      </Card>
    </div>
  );
}
