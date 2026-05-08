import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

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

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ainda não tem conta? <Link to="/cadastro" className="font-medium text-primary hover:underline">Criar conta</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
