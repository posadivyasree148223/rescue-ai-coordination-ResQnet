import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-fade-in">
      <div>
        {eyebrow && <p className="mb-1 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ai">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight md:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, subtitle, icon: Icon, actions, children, className, bodyClass }: { title?: string; subtitle?: string; icon?: LucideIcon; actions?: ReactNode; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card shadow-card", className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon className="size-4 text-ai" />}
            <div>
              <h2 className="text-sm font-semibold">{title}</h2>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {actions}
        </header>
      )}
      <div className={cn("p-5", bodyClass)}>{children}</div>
    </section>
  );
}

export function Metric({ label, value, hint, icon: Icon, tone = "ai" }: { label: string; value: ReactNode; hint?: string; icon: LucideIcon; tone?: "ai" | "danger" | "safe" | "warning" | "primary" }) {
  const toneCls = { ai: "text-ai bg-ai/10", danger: "text-danger bg-danger/10", safe: "text-safe bg-safe/10", warning: "text-warning bg-warning/10", primary: "text-primary bg-primary/10" }[tone];
  return (
    <div className="group rounded-xl border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className={cn("grid size-7 place-items-center rounded-lg", toneCls)}><Icon className="size-3.5" /></span>
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const s = status.toUpperCase();
  const tone =
    ["RESCUING", "SHORTAGE", "CRITICAL"].includes(s) ? "bg-danger/10 text-danger" :
    ["MOVING", "TRANSPORTING", "COMPUTING", "ALLOCATING"].includes(s) ? "bg-warning/15 text-warning" :
    ["SCANNING", "ACTIVE", "COORDINATING", "PRIORITIZING", "MONITORING"].includes(s) ? "bg-ai/10 text-ai" :
    ["DONE", "RESCUED", "COMPLETED"].includes(s) ? "bg-safe/10 text-safe" : "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide", tone)}>
      <span className="size-1.5 rounded-full bg-current" />{s}
    </span>
  );
}

export function SimBadge() {
  return <span className="rounded-md border border-warning/40 bg-warning/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-warning">Simulation · Academic demo</span>;
}

export function Formula({ children }: { children: ReactNode }) {
  return <code className="rounded-md bg-ai/10 px-2 py-1 font-mono text-sm font-medium text-ai">{children}</code>;
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/60 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-mono text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
