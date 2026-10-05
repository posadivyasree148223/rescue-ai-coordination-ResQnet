import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Boxes, HeartPulse, Droplets, Wheat, Wrench, Fuel, Truck, Zap, Workflow, BarChart3, ArrowDown, Check } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useSim } from "@/lib/sim-store";
import type { ResKey } from "@/lib/scenarios";
import { PageHeader, Panel, SimBadge, chartTip } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Dynamic Resource Allocation — ResQNet" },
      { name: "description", content: "How ResQNet's Medical and Logistics agents allocate limited supplies by utility-based priority." },
      { property: "og:title", content: "Dynamic Resource Allocation — ResQNet" },
      { property: "og:description", content: "Utility-based allocation of medical kits, water, food, fuel and vehicles." },
    ],
  }),
  component: ResourcesPage,
});

const META: Record<ResKey, { name: string; icon: typeof Boxes }> = {
  medicalKits: { name: "Medical Kits", icon: HeartPulse }, water: { name: "Water", icon: Droplets }, food: { name: "Food", icon: Wheat },
  equipment: { name: "Rescue Equipment", icon: Wrench }, fuel: { name: "Fuel", icon: Fuel }, vehicles: { name: "Emergency Vehicles", icon: Truck },
};

const CHAIN = [
  ["Victim Severity", "Critical victim detected in the field"],
  ["Medical Agent", "Increases triage priority to CRITICAL"],
  ["Priority Calculation", "U = severity + 2·wait − 1.5·distance"],
  ["Logistics Agent", "Checks inventory for a medical kit"],
  ["Resource Allocation", "Kit reserved and dispatched"],
  ["Rescue Agent", "Receives updated task and supplies"],
];

function ResourcesPage() {
  const { sim, allocate } = useSim();
  const [stage, setStage] = useState(-1);
  const runChain = () => {
    if (stage >= 0 && stage < CHAIN.length) return;
    setStage(0);
    CHAIN.forEach((_, i) => setTimeout(() => setStage(i + 1), (i + 1) * 650));
    setTimeout(() => allocate("medicalKits", 1, "Critical victim: kit allocated to nearest Rescue Agent"), CHAIN.length * 650);
  };
  const data = (Object.keys(META) as ResKey[]).map((k) => ({ name: META[k].name.split(" ")[0], allocated: sim.resources[k].allocated, remaining: sim.resources[k].total - sim.resources[k].allocated }));

  return (
    <>
      <PageHeader eyebrow="Dynamic Allocation" title="Resource Allocation" subtitle="Resource levels are live: they change as the simulation dispatches agents, consumes fuel and treats victims." actions={<SimBadge />} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(Object.keys(META) as ResKey[]).map((k) => {
          const r = sim.resources[k];
          const rem = r.total - r.allocated;
          const pct = (rem / r.total) * 100;
          const I = META[k].icon;
          return (
            <div key={k} className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-lg bg-ai/10 text-ai"><I className="size-4" /></span><p className="text-sm font-semibold">{META[k].name}</p></div>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => allocate(k, k === "water" || k === "fuel" ? 10 : 1, `Manual allocation of ${META[k].name}`)}>Allocate Resource</Button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[["Available", r.total], ["Allocated", r.allocated], ["Remaining", rem]].map(([l, v]) => (
                  <div key={l}><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</p><p className={cn("font-mono text-lg font-semibold tabular-nums transition-all", l === "Remaining" && pct < 25 && "text-danger")}>{v}</p></div>
                ))}
              </div>
              <Progress value={pct} className={cn("mt-2 h-1.5", pct < 25 && "[&>div]:bg-danger")} />
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[380px_1fr]">
        <Panel title="Allocation Decision Chain" subtitle="What happens when a critical victim appears" icon={Workflow} actions={<Button size="sm" onClick={runChain}><Zap /> Simulate critical victim</Button>}>
          <ol className="space-y-0">
            {CHAIN.map(([t, d], i) => {
              const done = stage > i, active = stage === i;
              return (
                <li key={t}>
                  <div className={cn("flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-500", done ? "border-safe/40 bg-safe/5" : active ? "border-ai bg-ai/5 shadow-card scale-[1.02]" : "bg-card")}>
                    <span className={cn("grid size-6 place-items-center rounded-full font-mono text-[10px] font-bold", done ? "bg-safe text-primary-foreground" : active ? "bg-ai text-primary-foreground animate-pulse" : "bg-muted text-muted-foreground")}>{done ? <Check className="size-3" /> : i + 1}</span>
                    <div><p className="text-[13px] font-semibold">{t}</p><p className="text-[11px] text-muted-foreground">{d}</p></div>
                  </div>
                  {i < CHAIN.length - 1 && <ArrowDown className={cn("mx-auto my-0.5 size-3.5", done ? "text-safe" : "text-muted-foreground/50")} />}
                </li>
              );
            })}
          </ol>
        </Panel>
        <div className="space-y-5">
          <Panel title="Resource Demand vs Availability" icon={BarChart3}>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={30} />
                  <RTooltip {...chartTip} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="allocated" stackId="a" fill="var(--warning)" name="Allocated (demand met)" />
                  <Bar dataKey="remaining" stackId="a" fill="var(--ai)" radius={[4, 4, 0, 0]} name="Remaining" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel title="Allocation Policy" icon={Boxes}>
            <div className="grid gap-3 text-xs md:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-3"><p className="mb-1 font-semibold">1 · Utility score</p><p className="font-mono text-ai">U = w(sev) + 2·wait − 1.5·dist</p><p className="mt-1 text-muted-foreground">w: critical 100, serious 60, minor 30</p></div>
              <div className="rounded-lg bg-muted/50 p-3"><p className="mb-1 font-semibold">2 · Greedy by utility</p><p className="text-muted-foreground">Requests are sorted by U; scarce items (kits, vehicles) go to highest utility first.</p></div>
              <div className="rounded-lg bg-muted/50 p-3"><p className="mb-1 font-semibold">3 · Release & re-allocate</p><p className="text-muted-foreground">Vehicles are released on delivery and immediately re-assigned by the Coordination Agent.</p></div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
