import { Link } from "react-router-dom";
import { Sparkles, Construction, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  description: string;
  features: string[];
  phase: number;
}

export function Placeholder({ title, description, features, phase }: Props) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl gradient-mesh border border-border p-10 lg:p-14 shadow-soft animate-fade-up">
        <div className="absolute top-6 right-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Em construção — Fase {phase}
        </div>

        <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center shadow-glow mb-6 animate-float">
          <Construction className="w-8 h-8 text-white" />
        </div>

        <h1 className="font-serif-display text-4xl lg:text-5xl mb-4">{title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed">{description}</p>

        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/60 hover-lift">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span className="text-sm text-foreground/90">{f}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="gradient-hero text-white shadow-glow border-0 hover:opacity-90">
            <Link to="/">Voltar à Dashboard <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
          <p className="text-xs text-muted-foreground self-center">
            Esta tela é entregue na <strong>Fase {phase}</strong> da implementação.
          </p>
        </div>
      </div>
    </div>
  );
}
