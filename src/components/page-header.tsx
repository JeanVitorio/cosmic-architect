import { ReactNode } from "react";

export function PageHeader({
  title, description, icon: Icon, actions,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-white shadow-brand-glow">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
