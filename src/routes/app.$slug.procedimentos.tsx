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
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock } from "lucide-react";
import { brl } from "@/lib/slugify";

export const Route = createFileRoute("/app/$slug/procedimentos")({
  component: ProceduresPage,
});

const schema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().min(0),
  duration_min: z.coerce.number().int().min(5).max(600),
});

function ProceduresPage() {
  const { clinic } = Route.useRouteContext();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ["procedures", clinic.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("procedures").select("*")
        .eq("clinic_id", clinic.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const create = useMutation({
    mutationFn: async (v: any) => {
      const { error } = await supabase.from("procedures").insert({ ...v, clinic_id: clinic.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Procedimento criado");
      qc.invalidateQueries({ queryKey: ["procedures", clinic.id] });
      setOpen(false); reset();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Procedimentos</h1>
          <p className="text-muted-foreground">Catálogo de serviços da clínica.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-brand text-white"><Plus className="mr-1 h-4 w-4" /> Novo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo procedimento</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit((v) => create.mutate(v))} className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input {...register("name")} placeholder="Limpeza de pele profunda" />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message as string}</p>}
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea {...register("description")} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Preço (R$)</Label>
                  <Input type="number" step="0.01" {...register("price")} defaultValue={0} />
                </div>
                <div>
                  <Label>Duração (min)</Label>
                  <Input type="number" {...register("duration_min")} defaultValue={60} />
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-brand text-white" disabled={create.isPending}>
                {create.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">Nenhum procedimento cadastrado.</Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Card key={p.id} className="p-6 transition hover:shadow-brand">
              <h3 className="font-display text-lg font-semibold">{p.name}</h3>
              {p.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
              <div className="mt-4 flex items-center justify-between">
                <span className="font-display text-xl font-bold text-gradient-brand">{brl(p.price)}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {p.duration_min} min
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
