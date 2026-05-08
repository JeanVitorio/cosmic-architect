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
import { Plus, Search, MessageCircle, Mail } from "lucide-react";
import { whatsappLink } from "@/lib/slugify";

export const Route = createFileRoute("/app/$slug/clientes")({
  component: ClientsPage,
});

const schema = z.object({
  full_name: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(0).max(20),
  birth_date: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

function ClientsPage() {
  const { clinic } = Route.useRouteContext();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients", clinic.id, search],
    queryFn: async () => {
      let q = supabase.from("clients").select("*").eq("clinic_id", clinic.id).order("created_at", { ascending: false });
      if (search) q = q.ilike("full_name", `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const create = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from("clients").insert({
        clinic_id: clinic.id,
        full_name: values.full_name,
        email: values.email || null,
        phone: values.phone || null,
        birth_date: values.birth_date || null,
        notes: values.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cliente cadastrada");
      qc.invalidateQueries({ queryKey: ["clients", clinic.id] });
      setOpen(false);
      reset();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-brand text-white"><Plus className="mr-1 h-4 w-4" /> Nova cliente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar cliente</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit((v) => create.mutate(v))} className="space-y-4">
              <div>
                <Label>Nome completo</Label>
                <Input {...register("full_name")} />
                {errors.full_name && <p className="mt-1 text-xs text-destructive">{errors.full_name.message as string}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Email</Label>
                  <Input type="email" {...register("email")} />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input {...register("phone")} />
                </div>
              </div>
              <div>
                <Label>Data de nascimento</Label>
                <Input type="date" {...register("birth_date")} />
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea {...register("notes")} />
              </div>
              <Button type="submit" disabled={create.isPending} className="w-full bg-gradient-brand text-white">
                {create.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {clients.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Nenhuma cliente ainda. Cadastre a primeira!</div>
        ) : (
          <div className="divide-y">
            {clients.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-muted/40">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand text-sm font-semibold text-white">
                    {c.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{c.full_name}</div>
                    <div className="text-xs text-muted-foreground">{c.phone || c.email || "Sem contato"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.phone && (
                    <a href={whatsappLink(c.phone, `Olá ${c.full_name.split(" ")[0]}!`)} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline"><MessageCircle className="mr-1 h-3 w-3" /> WhatsApp</Button>
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`}><Button size="sm" variant="ghost"><Mail className="h-4 w-4" /></Button></a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
