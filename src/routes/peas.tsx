import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Target, Globe, Cog, ScanEye, Layers, Brain, ArrowDown, ArrowRight } from "lucide-react";
import { PageHeader, Panel, SimBadge } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/peas")({
  head: () => ({
    meta: [
      { title: "PEAS & Environment — ResQNet" },
      { name: "description", content: "PEAS formulation, task-environment properties and agent architecture of the ResQNet multi-agent system." },
      { property: "og:title", content: "PEAS Framework & Environment — ResQNet" },
      { property: "og:description", content: "Performance, Environment, Actuators, Sensors and environment classification for ResQNet." },
    ],
  }),
  component: PeasPage,
});

const PEAS = [
  { k: "P", t: "Performance Measure", icon: Target, tone: "text-safe bg-safe/10", items: ["Number of victims rescued", "Rescue time", "Path efficiency", "Resource utilisation", "Agent coordination", "Safety"] },
  { k: "E", t: "Environment", icon: Globe, tone: "text-danger bg-danger/10", items: ["Disaster zones", "Roads", "Victims", "Hospitals", "Resource depots", "Hazards", "Dynamic conditions"] },
  { k: "A", t: "Actuators", icon: Cog, tone: "text-warning bg-warning/10", items: ["Agent movement", "Victim rescue", "Resource allocation", "Route selection", "Communication", "Emergency dispatch"] },
  { k: "S", t: "Sensors", icon: ScanEye, tone: "text-ai bg-ai/10", items: ["Map data", "Victim detection", "Hazard detection", "Resource inventory", "Agent status", "Environmental updates"] },
];

const ENV = [
  { p: "Observable", v: "Partially Observable", d: "Agents cannot see the entire disaster area at once.", ex: "Victims appear greyed-out until the recon drone scans within 2 cells." },
  { p: "Deterministic / Stochastic", v: "Stochastic", d: "Outcomes of the environment are uncertain.", ex: "Roads collapse at random with probability proportional to severity." },
  { p: "Episodic / Sequential", v: "Sequential", d: "Current decisions affect future states.", ex: "Assigning RA1 to V03 now determines who is free to rescue V05 later." },
  { p: "Static / Dynamic", v: "Dynamic", d: "The environment can change while agents are operating. Roads may become blocked, hazards may appear, and resource availability can change.", ex: "A route computed at T+5 may be invalid at T+8, forcing A* re-planning." },
  { p: "Discrete / Continuous", v: "Primarily Discrete", d: "States, actions and time are modelled as discrete units.", ex: "8×12 grid cells, 4-directional moves, 15-second ticks." },
  { p: "Single / Multi-Agent", v: "Multi-Agent (Cooperative)", d: "Several agents act in the same environment toward a shared goal.", ex: "Six agents share one objective: maximise victims rescued safely." },
];

const LOOP = ["Environment", "Sensors", "Agent Perception", "Decision / Search", "Action", "Environment Update", "Other Agents"];

function PeasPage() {
  const [sel, setSel] = useState(3);
  return (
    <>
      <PageHeader eyebrow="Task Environment" title="PEAS Framework" subtitle="Formal specification of the ResQNet task environment, following Russell & Norvig." actions={<SimBadge />} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PEAS.map((p) => (
          <div key={p.k} className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5">
            <span className="absolute -right-2 -top-6 font-mono text-[96px] font-bold text-muted/80">{p.k}</span>
            <span className={cn("relative grid size-10 place-items-center rounded-xl", p.tone)}><p.icon className="size-5" /></span>
            <h3 className="relative mt-3 font-mono text-xs font-semibold uppercase tracking-[0.14em]">{p.t}</h3>
            <ul className="relative mt-3 space-y-1.5 text-sm">
              {p.items.map((i) => <li key={i} className="flex items-center gap-2"><span className="size-1 rounded-full bg-muted-foreground" />{i}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <Panel title="Environment Properties" subtitle="Select a property to see its justification" icon={Layers} className="mt-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-1.5">
            {ENV.map((e, i) => (
              <button key={e.p} onClick={() => setSel(i)} className={cn("flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-all", sel === i ? "border-ai bg-ai/5" : "hover:bg-muted/50")}>
                <span className="text-xs text-muted-foreground">{e.p}</span>
                <span className="flex items-center gap-2 font-mono text-xs font-semibold uppercase">{e.v}<ArrowRight className={cn("size-3", sel === i ? "text-ai" : "opacity-0")} /></span>
              </button>
            ))}
          </div>
          <div key={sel} className="rounded-xl bg-muted/50 p-6 animate-fade-in">
            <p className="text-xs text-muted-foreground">{ENV[sel].p}</p>
            <p className="mt-1 font-mono text-2xl font-semibold uppercase text-ai">{ENV[sel].v}</p>
            <p className="mt-4 text-sm leading-relaxed">{ENV[sel].d}</p>
            <div className="mt-4 rounded-lg border bg-card p-4">
              <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Example from ResQNet</p>
              <p className="text-sm">{ENV[sel].ex}</p>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Agent Type" subtitle="Utility-Based / Goal-Oriented Cooperative Multi-Agent System" icon={Brain} className="mt-5">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px_1fr]">
          <div className="space-y-3 text-sm">
            <p className="leading-relaxed text-muted-foreground">Each ResQNet agent maintains an internal model of the partially-observed map, pursues explicit <b className="text-foreground">goals</b> (reach victim, deliver to hospital) and chooses among goals using a <b className="text-foreground">utility</b> function that trades off severity, waiting time and travel cost.</p>
            <ul className="space-y-2">
              {["Have goals", "Observe the environment", "Make decisions (search + utility)", "Coordinate with other agents", "Optimise rescue-related outcomes"].map((t) => (
                <li key={t} className="flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-safe/10 text-safe">✓</span>{t}</li>
              ))}
            </ul>
          </div>
          <ol className="flex flex-col items-center">
            {LOOP.map((s, i) => (
              <li key={s} className="flex w-full flex-col items-center">
                <div className={cn("w-full rounded-lg border px-3 py-2 text-center text-[13px] font-medium", i === 3 ? "border-ai bg-ai/10 text-ai" : i === 0 || i === 5 ? "bg-muted" : "bg-card")}>{s}</div>
                {i < LOOP.length - 1 && <ArrowDown className="my-0.5 size-3.5 text-muted-foreground" />}
              </li>
            ))}
          </ol>
          <div className="rounded-xl bg-muted/50 p-4 text-sm">
            <p className="mb-2 font-semibold">Cooperation between agents</p>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li><b className="text-foreground">Shared blackboard:</b> recon updates the common map used by all planners.</li>
              <li><b className="text-foreground">Task allocation:</b> the coordinator assigns each idle rescuer the victim with maximum utility, preventing two agents chasing one victim.</li>
              <li><b className="text-foreground">Resource negotiation:</b> medical priority drives logistics allocation.</li>
              <li><b className="text-foreground">Re-planning:</b> a blocked road broadcast triggers A* re-routes for every affected agent.</li>
            </ul>
          </div>
        </div>
      </Panel>
    </>
  );
}
