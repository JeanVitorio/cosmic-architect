import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export type Period = { from: Date; to: Date; label: string };

export function periodFromPreset(preset: "7d" | "30d" | "90d"): Period {
  const to = new Date();
  const from = new Date();
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  from.setDate(to.getDate() - days);
  from.setHours(0, 0, 0, 0);
  return { from, to, label: `Últimos ${days} dias` };
}

export function PeriodFilter({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({ from: value.from, to: value.to });

  const presets = [
    { id: "7d" as const, label: "7 dias" },
    { id: "30d" as const, label: "30 dias" },
    { id: "90d" as const, label: "90 dias" },
  ];

  return (
    <div className="flex items-center gap-1 rounded-xl border bg-card p-1 shadow-card">
      {presets.map((p) => (
        <Button key={p.id} size="sm" variant={value.label === `Últimos ${p.id === "7d" ? 7 : p.id === "30d" ? 30 : 90} dias` ? "default" : "ghost"}
          onClick={() => onChange(periodFromPreset(p.id))} className="h-8">
          {p.label}
        </Button>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="sm" variant={value.label === "Customizado" ? "default" : "ghost"} className="h-8 gap-2">
            <CalendarIcon className="h-3.5 w-3.5" />
            {value.label === "Customizado"
              ? `${format(value.from, "dd/MM")} → ${format(value.to, "dd/MM")}`
              : "Customizado"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={range as any}
            onSelect={(r: any) => setRange(r ?? {})}
            numberOfMonths={2}
            locale={ptBR}
            className="p-3 pointer-events-auto"
          />
          <div className="flex justify-end gap-2 border-t p-2">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={() => {
              if (range.from && range.to) {
                onChange({ from: range.from, to: range.to, label: "Customizado" });
                setOpen(false);
              }
            }}>Aplicar</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
