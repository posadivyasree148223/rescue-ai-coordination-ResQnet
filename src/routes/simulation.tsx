import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Pause, RotateCcw, StepForward, Gauge, Ban, UserPlus, MousePointer2, Route as RouteIcon, Activity, Map as MapIcon, SlidersHorizontal } from "lucide-react";
import { useSim } from "@/lib/sim-store";
import { metrics } from "@/lib/simulation";
import { LIVE_SCENARIOS, SCENARIOS, type ScenarioId } from "@/lib/scenarios";
import type { Severity } from "@/lib/resourceAllocation";
import { PageHeader, Panel, SimBadge, Stat, StatusPill } from "@/components/ui-kit";
import { DisasterMap, MapLegend } from "@/components/DisasterMap";
import { DecisionFeed } from "@/components/DecisionFeed";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { label } from "@/lib/grid";

export const Route = createFileRoute("/simulation")({
  head: () => ({
    meta: [
      { title: "Live Simulation — ResQNet" },
      { name: "description", content: "Interactive disaster rescue simulation: start, pause, add obstacles and victims, and watch AI agents re-plan." },
      { property: "og:title", content: "ResQNet Live Simulation" },
      { property: "og:description", content: "Run an interactive multi-agent disaster rescue simulation with A* re-planning." },
    ],
  }),
  component: SimulationPage,
});

type Tool = "none" | "block" | "victim";

function SimulationPage() {
  const { sim, start, pause, reset, stepOnce, setSpeed, setSeverity, toggleObstacle, addVictim, setResourceTotal, recalculate } = useSim();
  const [tool, setTool] = useState<Tool>("none");
  const [sev, setSev] = useState<Severity>("critical");
  const m = metrics(sim);
  const progress = Math.round((m.rescued / m.total) * 100);

  return (
    <>
      <PageHeader eyebrow="Interactive" title="Live Simulation" subtitle="Every tick, agents perceive the grid, the coordinator assigns tasks by utility, and A* plans routes. Click the map to change the environment." actions={<SimBadge />} />

      <div className="mb-5 flex flex-wrap gap-2">
        {LIVE_SCENARIOS.map((id) => (
          <button key={id} onClick={() => reset(id as ScenarioId)} className={cn("rounded-lg border px-3.5 py-2 text-left transition-all hover:border-ai/50", sim.scenarioId === id ? "border-ai bg-ai/5 shadow-card" : "bg-card")}>
            <p className="text-[13px] font-semibold">{SCENARIOS[id].name}</p>
            <p className="max-w-[220px] text-[11px] text-muted-foreground">{SCENARIOS[id].description}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel
          title="Simulation Grid"
          subtitle={`${SCENARIOS[sim.scenarioId].name} · 8 × 12 cells · tick = 15 s`}
          icon={MapIcon}
          actions={<StatusPill status={sim.status} />}
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {sim.status === "running" ? <Button onClick={pause} variant="outline"><Pause /> Pause</Button> : <Button onClick={start} disabled={sim.status === "completed"}><Play /> Start Simulation</Button>}
            <Button variant="outline" onClick={stepOnce} disabled={sim.status === "completed" || sim.status === "running"}><StepForward /> Step</Button>
            <Button variant="outline" onClick={() => reset()}><RotateCcw /> Reset</Button>
            <Button variant="outline" onClick={recalculate}><RouteIcon /> Recalculate Route</Button>
            <div className="ml-auto flex items-center gap-1 rounded-lg border p-1">
              <Gauge className="mx-1 size-4 text-muted-foreground" />
              {[1, 2, 4].map((s) => <button key={s} onClick={() => setSpeed(s)} className={cn("rounded-md px-2.5 py-1 font-mono text-xs", sim.speed === s ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>{s}×</button>)}
            </div>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-muted/50 p-2 text-xs">
            <span className="px-1 font-medium text-muted-foreground">Map tool:</span>
            <ToolBtn active={tool === "none"} onClick={() => setTool("none")} icon={MousePointer2}>Inspect</ToolBtn>
            <ToolBtn active={tool === "block"} onClick={() => setTool("block")} icon={Ban}>Add / clear obstacle</ToolBtn>
            <ToolBtn active={tool === "victim"} onClick={() => setTool("victim")} icon={UserPlus}>Add victim</ToolBtn>
            {tool === "victim" && (
              <div className="flex gap-1">
                {(["critical", "serious", "minor"] as Severity[]).map((s) => <button key={s} onClick={() => setSev(s)} className={cn("rounded-md border px-2 py-1 capitalize", sev === s ? "border-foreground bg-card font-semibold" : "border-transparent")}>{s}</button>)}
              </div>
            )}
            <span className="ml-auto text-muted-foreground">{tool === "none" ? "Hover entities for details" : "Click any cell on the grid"}</span>
          </div>

          <DisasterMap
            grid={sim.grid}
            agents={sim.agents}
            victims={sim.victims}
            paths={sim.agents.filter((a) => a.path.length).map((a) => ({ points: [a.pos, ...a.path], tone: a.status === "TRANSPORTING" ? "safe" : "ai" }))}
            onCellClick={tool === "none" ? undefined : (p) => (tool === "block" ? toggleObstacle(p) : addVictim(p, sev))}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><MapLegend /></div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs"><span className="font-medium">Operation progress</span><span className="font-mono text-muted-foreground">{m.rescued}/{m.total} rescued · {progress}%</span></div>
            <Progress value={progress} className="h-2" />
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Controls" icon={SlidersHorizontal}>
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex justify-between text-xs"><span className="font-medium">Disaster severity</span><span className="font-mono">{["", "Low", "Moderate", "Severe"][sim.severity]}</span></div>
                <Slider min={1} max={3} step={1} value={[sim.severity]} onValueChange={([v]) => setSeverity(v as 1 | 2 | 3)} />
                <p className="mt-1.5 text-[11px] text-muted-foreground">Higher severity → more random road collapses (stochastic environment).</p>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-xs"><span className="font-medium">Medical kits available</span><span className="font-mono">{sim.resources.medicalKits.total}</span></div>
                <Slider min={1} max={50} step={1} value={[sim.resources.medicalKits.total]} onValueChange={([v]) => setResourceTotal("medicalKits", v)} />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-xs"><span className="font-medium">Water units</span><span className="font-mono">{sim.resources.water.total}</span></div>
                <Slider min={10} max={200} step={5} value={[sim.resources.water.total]} onValueChange={([v]) => setResourceTotal("water", v)} />
              </div>
            </div>
          </Panel>
          <Panel title="Live Metrics" icon={Activity}>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Sim time" value={`${m.duration.toFixed(1)}m`} />
              <Stat label="A* searches" value={sim.stats.searches} />
              <Stat label="Nodes explored" value={sim.stats.nodesExplored} />
              <Stat label="Re-routes" value={sim.stats.reroutes} />
            </div>
            {sim.lastSearch && (
              <p className="mt-3 text-[11px] text-muted-foreground">
                Last search: <span className="font-medium text-foreground">{sim.lastSearch.agentId}</span> {label(sim.lastSearch.from)} → {label(sim.lastSearch.to)} · cost {sim.lastSearch.result.cost} · {sim.lastSearch.result.explored.length} nodes
              </p>
            )}
          </Panel>
          <Panel title="Agent Decisions" icon={Activity} bodyClass="max-h-[360px] overflow-y-auto p-3">
            <DecisionFeed decisions={sim.decisions} limit={20} compact />
          </Panel>
        </div>
      </div>
    </>
  );
}

function ToolBtn({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: typeof Ban; children: string }) {
  return <button onClick={onClick} className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors", active ? "bg-card font-semibold shadow-card" : "hover:bg-card/60")}><Icon className="size-3.5" />{children}</button>;
}
