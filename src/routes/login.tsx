import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { ensureDemoAccount } from "@/lib/demo-seed.functions";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { UnaLogo } from "@/components/una-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — UNA" }] }),
  component: Login,
});

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});
type FormData = z.infer<typeof schema>;

function Login() {
  const navigate = useNavigate();
  const ensureDemo = useServerFn(ensureDemoAccount);
  const [demoLoading, setDemoLoading] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      const creds = await ensureDemo();
      setValue("email", creds.email);
      setValue("password", creds.password);
      const { data, error } = await supabase.auth.signInWithPassword({ email: creds.email, password: creds.password });
      if (error) throw error;
      if (!data.user) throw new Error("Falha no login demo");
      toast.success("Acessando conta demo...");
      navigate({ to: "/app/$slug/dashboard", params: { slug: creds.slug } });
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao acessar demo");
    } finally {
      setDemoLoading(false);
    }
  };

  const onSubmit = async (values: FormData) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(values);
      if (error) throw error;
      if (!data.user) throw new Error("Falha no login");

      const { data: members } = await supabase
        .from("clinic_members")
        .select("clinics(slug, status)")
        .eq("user_id", data.user.id)
        .eq("active", true);

      const active = (members ?? []).find((m: any) => m.clinics?.status === "active");
      const pending = (members ?? []).find((m: any) => m.clinics?.status === "pending");

      if (active) {
        toast.success("Bem-vinda de volta!");
        navigate({ to: "/app/$slug/dashboard", params: { slug: (active as any).clinics.slug } });
      } else if (pending) {
        await supabase.auth.signOut();
        toast.error("Sua clínica ainda está pendente de ativação.");
      } else {
        await supabase.auth.signOut();
        toast.error("Você não tem clínicas ativas vinculadas.");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao entrar");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-brand-soft">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <Link to="/" className="mb-8 self-center"><UnaLogo size={40} /></Link>
        <Card className="p-8 shadow-card">
          <h1 className="font-display text-2xl font-bold">Entrar no UNA</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acesse o painel da sua clínica.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-brand text-white hover:opacity-90">
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            onClick={handleDemo}
            disabled={demoLoading}
            variant="outline"
            className="w-full border-primary/40 hover:bg-primary/5"
          >
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            {demoLoading ? "Preparando demo..." : "Acessar conta DEMO"}
          </Button>

          <div className="mt-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground">Credenciais demo (preenchidas automaticamente):</div>
            <div className="mt-1">📧 <span className="font-mono">demo@una.app</span></div>
            <div>🔑 <span className="font-mono">demo123456</span></div>
            <div className="mt-1 text-[11px]">Clínica já ativa com dados de exemplo (clientes, agendamentos, leads, financeiro).</div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ainda não tem conta? <Link to="/cadastro" className="font-medium text-primary hover:underline">Criar conta</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
