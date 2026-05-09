import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({
  label, value, hint, icon: Icon, trend, sparkline, accent = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: number;
  sparkline?: number[];
  accent?: "primary" | "violet" | "cyan" | "mint" | "warning";
}) {
  const accents = {
    primary: "from-[oklch(0.55_0.22_258)] to-[oklch(0.62_0.22_305)]",
    violet: "from-[oklch(0.62_0.22_305)] to-[oklch(0.78_0.15_205)]",
    cyan: "from-[oklch(0.78_0.15_205)] to-[oklch(0.82_0.14_175)]",
    mint: "from-[oklch(0.82_0.14_175)] to-[oklch(0.7_0.16_165)]",
    warning: "from-[oklch(0.78_0.16_75)] to-[oklch(0.7_0.18_50)]",
  } as const;

  return (
    <Card className="group relative overflow-hidden p-5 hover-lift">
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", accents[accent])} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-2xl font-bold leading-none">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
          {typeof trend === "number" && (
            <div className={cn("mt-2 inline-flex items-center gap-1 text-xs font-medium",
              trend >= 0 ? "text-success" : "text-destructive")}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-brand-glow", accents[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {sparkline && sparkline.length > 0 && (
        <div className="mt-3 h-10 -mx-1 opacity-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline.map((y, x) => ({ x, y }))}>
              <Line type="monotone" dataKey="y" stroke="currentColor" strokeWidth={2} dot={false} className="text-primary" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

export function EmptyState({
  icon: Icon, title, description, action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center animate-fade-in">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand-soft">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {action}
    </Card>
  );
}
