import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slugify";
import { UnaLogo } from "@/components/una-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/cadastro")({
  head: () => ({ meta: [{ title: "Criar conta — UNA" }] }),
  component: Signup,
});

const schema = z.object({
  clinicName: z.string().min(2, "Mínimo 2 caracteres").max(80),
  fullName: z.string().min(2).max(80),
  email: z.string().email("Email inválido").max(120),
  phone: z.string().min(10).max(20),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
});
type FormData = z.infer<typeof schema>;

function Signup() {
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    try {
      const { data: signUp, error: signErr } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: { full_name: values.fullName, phone: values.phone },
        },
      });
      if (signErr) throw signErr;
      if (!signUp.user) throw new Error("Erro ao criar usuário");

      // Create clinic with unique slug
      const baseSlug = slugify(values.clinicName) || "clinica";
      let slug = baseSlug;
      for (let i = 0; i < 5; i++) {
        const { data: exists } = await supabase.from("clinics").select("id").eq("slug", slug).maybeSingle();
        if (!exists) break;
        slug = `${baseSlug}-${Math.floor(Math.random() * 9999)}`;
      }

      const { data: clinic, error: clinicErr } = await supabase
        .from("clinics")
        .insert({ name: values.clinicName, slug, email: values.email, phone: values.phone, status: "pending" })
        .select()
        .single();
      if (clinicErr) throw clinicErr;

      const { error: memberErr } = await supabase
        .from("clinic_members")
        .insert({ clinic_id: clinic.id, user_id: signUp.user.id, role: "owner", active: true });
      if (memberErr) throw memberErr;

      setDone(true);
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao criar conta");
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-brand-soft">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
          <CheckCircle2 className="h-16 w-16 text-success" />
          <h1 className="mt-6 font-display text-3xl font-bold">Conta criada!</h1>
          <p className="mt-2 text-muted-foreground">
            Sua clínica está com status <strong>pendente</strong>. Em breve nossa equipe ativará seu acesso.
          </p>
          <Button onClick={() => navigate({ to: "/" })} className="mt-8">Voltar ao início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-brand-soft">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <Link to="/" className="mb-8 self-center"><UnaLogo size={40} /></Link>
        <Card className="p-8 shadow-card">
          <h1 className="font-display text-2xl font-bold">Crie sua clínica no UNA</h1>
          <p className="mt-1 text-sm text-muted-foreground">Leva menos de 2 minutos.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="clinicName">Nome da clínica</Label>
              <Input id="clinicName" {...register("clinicName")} placeholder="Bella Estética" />
              {errors.clinicName && <p className="mt-1 text-xs text-destructive">{errors.clinicName.message}</p>}
            </div>
            <div>
              <Label htmlFor="fullName">Seu nome</Label>
              <Input id="fullName" {...register("fullName")} placeholder="Maria Silva" />
              {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="voce@clinica.com" />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Telefone (WhatsApp)</Label>
              <Input id="phone" {...register("phone")} placeholder="(11) 99999-9999" />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...register("password")} placeholder="Mínimo 8 caracteres" />
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-brand text-white hover:opacity-90">
              {isSubmitting ? "Criando..." : "Criar minha conta"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta? <Link to="/login" className="font-medium text-primary hover:underline">Entrar</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
