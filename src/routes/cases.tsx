import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play, CheckCircle2 } from "lucide-react";
import { runToCompletion, metrics, type SimState } from "@/lib/simulation";
import { SCENARIOS, type ScenarioId } from "@/lib/scenarios";
import { PageHeader, Panel, Stat, SimBadge } from "@/components/ui-kit";
import { DisasterMap } from "@/components/DisasterMap";
import { DecisionFeed } from "@/components/DecisionFeed";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/cases")({
  head: () => ({
    meta: [
      { title: "Working Cases — ResQNet" },
      { name: "description", content: "Two fully simulated working cases: single-zone earthquake and multi-zone flood rescue." },
      { property: "og:title", content: "Working Cases — ResQNet" },
      { property: "og:description", content: "Run and replay two complete multi-agent rescue cases with metrics." },
    ],
  }),
  component: CasesPage,
});

export function CaseRunner({ id }: { id: ScenarioId }) {
  const [frames, setFrames] = useState<SimState[] | null>(null);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!frames || i >= frames.length - 1) return;
    const t = setTimeout(() => setI((x) => x + 1), 180);
    return () => clearTimeout(t);
  }, [frames, i]);
  const s = frames ? frames[i] : null;
  const def = SCENARIOS[id];
  const m = s ? metrics(s) : null;
  return (
    <Panel title={def.name} subtitle={def.description} icon={CheckCircle2} actions={<Button size="sm" onClick={() => { setFrames(runToCompletion(id)); setI(0); }}><Play /> Run Case</Button>}>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div>
          {s ? (
            <DisasterMap grid={s.grid} agents={s.agents} victims={s.victims} paths={s.agents.filter((a) => a.path.length).map((a) => ({ points: [a.pos, ...a.path], tone: a.status === "TRANSPORTING" ? "safe" : "ai" }))} />
          ) : (
            <DisasterMap grid={runToCompletion(id, 0)[0].grid} victims={runToCompletion(id, 0)[0].victims} agents={runToCompletion(id, 0)[0].agents} />
          )}
          {frames && (
            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className="font-mono">T+{i}</span>
              <Slider min={0} max={frames.length - 1} value={[i]} onValueChange={([v]) => setI(v)} />
              <span className="font-mono text-muted-foreground">{frames.length - 1}</span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Rescued" value={m ? `${m.rescued}/${m.total}` : "—"} />
            <Stat label="Duration" value={m ? `${m.duration.toFixed(1)}m` : "—"} />
            <Stat label="Avg rescue" value={m && m.avgRescue ? `${m.avgRescue.toFixed(1)}m` : "—"} />
            <Stat label="A* searches" value={s ? s.stats.searches : "—"} />
            <Stat label="Re-routes" value={s ? s.stats.reroutes : "—"} />
            <Stat label="Kits used" value={s ? `${s.resources.medicalKits.allocated}/${s.resources.medicalKits.total}` : "—"} />
          </div>
          <div className="max-h-64 overflow-y-auto">{s ? <DecisionFeed decisions={s.decisions} limit={30} compact /> : <p className="text-xs text-muted-foreground">Initial state shown. Press Run Case to watch agent decisions, A* routes and allocation unfold.</p>}</div>
        </div>
      </div>
    </Panel>
  );
}

function CasesPage() {
  return (
    <>
      <PageHeader eyebrow="Validation" title="Working Cases" subtitle="Each case runs the real simulation engine headlessly, then replays every state so you can scrub through agent decisions." actions={<SimBadge />} />
      <div className="space-y-5"><CaseRunner id="case1" /><CaseRunner id="case2" /></div>
    </>
  );
}
