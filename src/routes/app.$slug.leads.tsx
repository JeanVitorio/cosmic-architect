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
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Copy, MessageCircle, ExternalLink } from "lucide-react";
import { slugify, whatsappLink } from "@/lib/slugify";
import { format } from "date-fns";

export const Route = createFileRoute("/app/$slug/leads")({
  component: LeadsPage,
});

const formSchema = z.object({
  procedure_id: z.string().uuid(),
  headline: z.string().min(3).max(120),
  subheadline: z.string().max(200).optional(),
});

function LeadsPage() {
  const { slug } = Route.useParams();
  const { clinic } = Route.useRouteContext();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: leads = [] } = useQuery({
    queryKey: ["leads", clinic.id],
    queryFn: async () => (await supabase.from("leads").select("*, procedures(name)").eq("clinic_id", clinic.id).order("created_at", { ascending: false })).data ?? [],
  });

  const { data: forms = [] } = useQuery({
    queryKey: ["lead-forms", clinic.id],
    queryFn: async () => (await supabase.from("lead_forms").select("*, procedures(name)").eq("clinic_id", clinic.id).order("created_at", { ascending: false })).data ?? [],
  });

  const { data: procedures = [] } = useQuery({
    queryKey: ["procedures-list", clinic.id],
    queryFn: async () => (await supabase.from("procedures").select("id, name").eq("clinic_id", clinic.id).eq("active", true)).data ?? [],
  });

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({ resolver: zodResolver(formSchema) });

  const createForm = useMutation({
    mutationFn: async (v: any) => {
      const proc = procedures.find((p) => p.id === v.procedure_id);
      const formSlug = slugify(`${proc?.name ?? "procedimento"}-${Math.floor(Math.random() * 9999)}`);
      const { error } = await supabase.from("lead_forms").insert({
        clinic_id: clinic.id,
        procedure_id: v.procedure_id,
        slug: formSlug,
        headline: v.headline,
        subheadline: v.subheadline || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Formulário criado");
      qc.invalidateQueries({ queryKey: ["lead-forms"] });
      setOpen(false); reset();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const formUrl = (formSlug: string) => `${typeof window !== "undefined" ? window.location.origin : ""}/c/${slug}/captacao/${formSlug}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Captação de Leads</h1>
          <p className="text-muted-foreground">Crie links únicos por procedimento e receba leads.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-brand text-white"><Plus className="mr-1 h-4 w-4" /> Novo formulário</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo formulário de captação</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit((v) => createForm.mutate(v))} className="space-y-4">
              <div>
                <Label>Procedimento</Label>
                <Select onValueChange={(v) => setValue("procedure_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{procedures.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
                {errors.procedure_id && <p className="mt-1 text-xs text-destructive">Obrigatório</p>}
              </div>
              <div>
                <Label>Título</Label>
                <Input {...register("headline")} placeholder="Limpeza de pele com 50% off" />
              </div>
              <div>
                <Label>Subtítulo</Label>
                <Input {...register("subheadline")} placeholder="Promoção apenas esta semana" />
              </div>
              <Button type="submit" className="w-full bg-gradient-brand text-white">Criar formulário</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Meus formulários</h2>
        <div className="mt-4 space-y-2">
          {forms.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum formulário criado.</p>
          ) : forms.map((f: any) => {
            const url = formUrl(f.slug);
            return (
              <div key={f.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                <div>
                  <div className="font-medium">{f.headline}</div>
                  <div className="text-xs text-muted-foreground">{f.procedures?.name} • {url}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copiado"); }}>
                    <Copy className="mr-1 h-3 w-3" /> Copiar
                  </Button>
                  <a href={url} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="ghost"><ExternalLink className="h-4 w-4" /></Button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Leads recebidos</h2>
        {leads.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Nenhum lead ainda.</p>
        ) : (
          <div className="mt-4 divide-y">
            {leads.map((l: any) => (
              <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {l.procedures?.name ?? "—"} • {format(new Date(l.created_at), "dd/MM HH:mm")} • <Badge variant="outline">{l.status}</Badge>
                  </div>
                  {l.message && <div className="mt-1 text-sm text-muted-foreground">"{l.message}"</div>}
                </div>
                {l.phone && (
                  <a href={whatsappLink(l.phone, `Olá ${l.name.split(" ")[0]}, vi seu interesse no UNA!`)} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline"><MessageCircle className="mr-1 h-3 w-3" /> WhatsApp</Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
