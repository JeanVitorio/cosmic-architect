import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnaLogo } from "@/components/una-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  CalendarCheck, Users, Camera, Sparkles, Wallet, BarChart3, MessageCircle,
  Shield, Check, Star, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UNA — Sistema premium para clínicas de estética" },
      { name: "description", content: "Agenda, clientes, prontuário, captação de leads e financeiro em um só lugar. Comece gratuitamente." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: CalendarCheck, title: "Agenda inteligente", desc: "Calendário por profissional e sala, bloqueios e confirmações." },
  { icon: Users, title: "Gestão de clientes", desc: "Cadastro completo, anamnese e histórico em um só lugar." },
  { icon: Camera, title: "Fotos antes & depois", desc: "Linha do tempo visual da evolução de cada cliente." },
  { icon: Sparkles, title: "Procedimentos", desc: "Catálogo com preços, fotos e tempo de execução." },
  { icon: MessageCircle, title: "Captação de leads", desc: "Links únicos por procedimento prontos para anúncios." },
  { icon: Wallet, title: "Financeiro & pacotes", desc: "Sessões restantes, pagamentos e recebíveis do mês." },
  { icon: BarChart3, title: "Relatórios", desc: "Faturamento, ocupação e conversão em tempo real." },
  { icon: Shield, title: "Multiusuário com permissões", desc: "Recepção, esteticistas, financeiro e admin com acessos distintos." },
];

const testimonials = [
  { name: "Ana Beatriz", role: "Clínica Pure Skin", text: "Reduzi em 70% o tempo de agendamento. A equipe ama a interface." },
  { name: "Carolina Mendes", role: "Estética Aurora", text: "O prontuário com fotos é tudo. Minhas clientes adoram ver a evolução." },
  { name: "Juliana Castro", role: "Bella Forma", text: "Os formulários de captação dispararam meu fluxo de novas clientes." },
];

const plans = [
  { name: "Essencial", price: "R$ 97", desc: "Para começar com o pé direito", features: ["Até 2 profissionais", "Agenda + clientes", "1.000 fotos no prontuário", "Suporte por email"] },
  { name: "Pro", price: "R$ 197", highlight: true, desc: "Para clínicas em crescimento", features: ["Profissionais ilimitados", "Captação de leads", "Financeiro completo", "Relatórios avançados", "Suporte prioritário"] },
  { name: "Premium", price: "R$ 397", desc: "Para redes e multiunidades", features: ["Tudo do Pro", "Multiunidades", "Onboarding dedicado", "API & integrações", "Gerente de sucesso"] },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/"><UnaLogo /></Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#recursos" className="text-sm text-muted-foreground hover:text-foreground">Recursos</a>
            <a href="#depoimentos" className="text-sm text-muted-foreground hover:text-foreground">Depoimentos</a>
            <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground">Planos</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
            <Link to="/cadastro"><Button size="sm" className="bg-gradient-brand text-white hover:opacity-90">Começar grátis</Button></Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-brand-soft" />
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-brand-cyan/30 blur-3xl" />
        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-brand-mint/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 border bg-background/60 backdrop-blur">
              <Sparkles className="mr-1 h-3 w-3" /> Novo • Disponível para clínicas em todo o Brasil
            </Badge>
            <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              O sistema <span className="text-gradient-brand">completo</span> para sua clínica de estética
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Agenda, clientes, prontuário com fotos, captação de leads e financeiro em um único lugar — bonito, rápido e fácil de usar.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/cadastro">
                <Button size="lg" className="bg-gradient-brand text-white shadow-brand hover:opacity-90">
                  Criar minha clínica grátis <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <a href="#recursos">
                <Button size="lg" variant="outline">Ver recursos</Button>
              </a>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">14 dias grátis • Sem cartão de crédito</p>
          </div>

          {/* Mock dashboard */}
          <div className="mx-auto mt-16 max-w-5xl">
            <Card className="overflow-hidden border bg-card/80 p-2 shadow-brand backdrop-blur">
              <div className="rounded-lg bg-gradient-brand p-1">
                <div className="rounded-md bg-card p-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Agendamentos hoje", value: "24" },
                      { label: "Novos leads", value: "12" },
                      { label: "Faturamento do mês", value: "R$ 48.7k" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border bg-background p-4">
                        <div className="text-xs text-muted-foreground">{s.label}</div>
                        <div className="mt-1 font-display text-2xl font-bold">{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid h-32 place-items-center rounded-lg bg-gradient-brand-soft text-sm text-muted-foreground">
                    Visualização do dashboard
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="recursos" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold">Tudo que sua clínica precisa</h2>
          <p className="mt-4 text-muted-foreground">Módulos pensados especificamente para o dia a dia da estética.</p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="group p-6 transition hover:shadow-brand">
              <div className="inline-flex rounded-xl bg-gradient-brand-soft p-3 transition group-hover:scale-110">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="depoimentos" className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-bold">Clínicas que já amam o UNA</h2>
            <p className="mt-4 text-muted-foreground">Profissionais reais transformando suas rotinas.</p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="p-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}
                </div>
                <p className="mt-4 text-sm">"{t.text}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand text-sm font-semibold text-white">
                    {t.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="planos" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold">Planos que cabem na sua clínica</h2>
          <p className="mt-4 text-muted-foreground">Comece pequeno, cresça quando quiser.</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.name} className={`relative p-8 ${p.highlight ? "border-2 border-primary shadow-brand" : ""}`}>
              {p.highlight && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-brand text-white">Mais popular</Badge>
              )}
              <h3 className="font-display text-2xl font-bold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{p.price}</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/cadastro">
                <Button className={`mt-8 w-full ${p.highlight ? "bg-gradient-brand text-white" : ""}`} variant={p.highlight ? "default" : "outline"}>
                  Começar agora
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-muted/30 py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center font-display text-4xl font-bold">Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="mt-10">
            {[
              { q: "Como funciona o período grátis?", a: "Você cria sua conta e tem 14 dias para testar todos os recursos sem cobrança." },
              { q: "Preciso instalar algo?", a: "Não. O UNA é 100% online e funciona em qualquer dispositivo." },
              { q: "Meus dados ficam seguros?", a: "Sim. Cada clínica tem seus dados isolados com camadas de segurança no banco." },
              { q: "Posso cancelar quando quiser?", a: "Pode sim, sem fidelidade e sem multa." },
            ].map((item, i) => (
              <AccordionItem key={i} value={`i-${i}`}>
                <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <Card className="overflow-hidden border-0 bg-gradient-brand p-12 text-center text-white shadow-brand">
          <h2 className="font-display text-4xl font-bold">Pronta para transformar sua clínica?</h2>
          <p className="mt-4 text-white/90">Crie sua conta em menos de 2 minutos.</p>
          <Link to="/cadastro">
            <Button size="lg" variant="secondary" className="mt-8">
              Começar grátis <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-background">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <UnaLogo />
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} UNA. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
