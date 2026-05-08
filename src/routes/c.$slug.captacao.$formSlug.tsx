import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { UnaLogo } from "@/components/una-logo";
import { CheckCircle2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/c/$slug/captacao/$formSlug")({
  component: CapturePage,
});

const schema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(20),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().max(500).optional(),
});

function CapturePage() {
  const { slug, formSlug } = useParams({ from: "/c/$slug/captacao/$formSlug" });
  const [form, setForm] = useState<any>(null);
  const [clinic, setClinic] = useState<any>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase.from("clinics").select("id, name").eq("slug", slug).maybeSingle();
      if (!c) { setLoading(false); return; }
      setClinic(c);
      const { data: f } = await supabase.from("lead_forms").select("*").eq("clinic_id", c.id).eq("slug", formSlug).eq("active", true).maybeSingle();
      setForm(f);
      setLoading(false);
    })();
  }, [slug, formSlug]);

  const onSubmit = async (v: any) => {
    if (!form || !clinic) return;
    const { error } = await supabase.from("leads").insert({
      clinic_id: clinic.id, lead_form_id: form.id, procedure_id: form.procedure_id,
      name: v.name, phone: v.phone, email: v.email || null, message: v.message || null, source: "captacao",
    });
    if (error) { toast.error("Erro ao enviar"); return; }
    setDone(true);
  };

  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Carregando...</div>;
  if (!form || !clinic) return <div className="grid min-h-screen place-items-center text-muted-foreground">Formulário não disponível.</div>;

  return (
    <div className="min-h-screen bg-gradient-brand-soft">
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="mb-8 flex items-center justify-center"><UnaLogo /></div>
        <Card className="overflow-hidden p-8 shadow-brand">
          <div className="mb-6 inline-flex rounded-xl bg-gradient-brand-soft p-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold">{form.headline}</h1>
          {form.subheadline && <p className="mt-2 text-muted-foreground">{form.subheadline}</p>}
          <p className="mt-1 text-xs text-muted-foreground">{clinic.name}</p>

          {done ? (
            <div className="mt-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              <h2 className="mt-4 font-display text-xl font-bold">Recebemos seu contato!</h2>
              <p className="mt-2 text-sm text-muted-foreground">Em breve a clínica entrará em contato.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div><Label>Nome</Label><Input {...register("name")} />{errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message as string}</p>}</div>
              <div><Label>WhatsApp</Label><Input {...register("phone")} placeholder="(11) 99999-9999" />{errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message as string}</p>}</div>
              <div><Label>Email (opcional)</Label><Input type="email" {...register("email")} /></div>
              <div><Label>Mensagem (opcional)</Label><Textarea {...register("message")} /></div>
              <Button type="submit" className="w-full bg-gradient-brand text-white" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Quero receber contato"}
              </Button>
            </form>
          )}
        </Card>
        <p className="mt-6 text-center text-xs text-muted-foreground">Powered by UNA</p>
      </div>
    </div>
  );
}
