import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, PlayCircle, Network, Route, Boxes, BookOpen, CheckCircle2, AlertTriangle, Sigma, GitCompare, ScrollText, Info, Menu, X, RotateCcw, Radio,
} from "lucide-react";
import { useSim } from "@/lib/sim-store";
import { clock } from "@/lib/simulation";
import { LIVE_SCENARIOS, SCENARIOS, type ScenarioId } from "@/lib/scenarios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Command Center", icon: LayoutDashboard },
  { to: "/simulation", label: "Live Simulation", icon: PlayCircle },
  { to: "/agents", label: "Agent Network", icon: Network },
  { to: "/search", label: "Search & Paths", icon: Route },
  { to: "/resources", label: "Resource Allocation", icon: Boxes },
  { to: "/peas", label: "PEAS Analysis", icon: BookOpen },
  { to: "/cases", label: "Working Cases", icon: CheckCircle2 },
  { to: "/edge-cases", label: "Edge Cases", icon: AlertTriangle },
  { to: "/complexity", label: "Complexity", icon: Sigma },
  { to: "/comparison", label: "Algorithm Comparison", icon: GitCompare },
  { to: "/log", label: "Decision Log", icon: ScrollText },
  { to: "/about", label: "About", icon: Info },
] as const;

function Sidebar({ onNav }: { onNav?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-full flex-col bg-navy text-navy-foreground">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="grid size-9 place-items-center rounded-lg bg-ai/90"><Radio className="size-4.5 text-primary-foreground" /></div>
        <div>
          <p className="font-mono text-sm font-bold tracking-[0.2em]">RESQNET</p>
          <p className="text-[11px] text-navy-muted">AI Disaster Response</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {NAV.map((n) => {
          const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={onNav}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors",
                active ? "bg-navy-2 font-medium text-navy-foreground" : "text-navy-muted hover:bg-navy-2/60 hover:text-navy-foreground",
              )}
            >
              <n.icon className={cn("size-4", active ? "text-ai" : "")} />
              {n.label}
              {active && <span className="ml-auto size-1.5 rounded-full bg-ai" />}
            </Link>
          );
        })}
      </nav>
     
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { sim, reset } = useSim();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const statusTone = { running: "bg-safe", paused: "bg-warning", idle: "bg-muted-foreground", completed: "bg-ai" }[sim.status];

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block"><Sidebar /></aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 animate-slide-in-right"><Sidebar onNav={() => setOpen(false)} /></div>
        </div>
      )}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-card/85 px-4 py-2.5 backdrop-blur md:px-8">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">{open ? <X /> : <Menu />}</Button>
        <p className="hidden font-mono text-[11px] uppercase tracking-widest text-muted-foreground md:block">Operation · {SCENARIOS[sim.scenarioId].name}</p>
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5">
            <span className={cn("size-2 rounded-full", statusTone, sim.status === "running" && "animate-pulse")} />
            <span className="font-mono text-[11px] font-semibold uppercase">{sim.status}</span>
            <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">T+{sim.tick} · {clock(sim.tick)}</span>
          </div>
          <Select value={LIVE_SCENARIOS.includes(sim.scenarioId) ? sim.scenarioId : undefined} onValueChange={(v) => reset(v as ScenarioId)}>
            <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue placeholder={SCENARIOS[sim.scenarioId].name} /></SelectTrigger>
            <SelectContent>{LIVE_SCENARIOS.map((id) => <SelectItem key={id} value={id}>{SCENARIOS[id].name}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-8" onClick={() => reset()}><RotateCcw className="size-3.5" /><span className="hidden sm:inline">Reset Simulation</span></Button>
        </div>
      </header>
      <main key={path} className="mx-auto max-w-[1400px] px-4 py-6 animate-fade-in md:px-8 md:py-8">{children}</main>
    </div>
  );
}
