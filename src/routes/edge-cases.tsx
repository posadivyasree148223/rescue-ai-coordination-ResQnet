import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, AlertTriangle } from "lucide-react";
import { parseGrid } from "@/lib/grid";
import { astar } from "@/lib/astar";
import { allocateByPriority, type AllocationRequest } from "@/lib/resourceAllocation";
import { PageHeader, Panel, Stat, SimBadge } from "@/components/ui-kit";
import { DisasterMap } from "@/components/DisasterMap";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/edge-cases")({
  head: () => ({
    meta: [
      { title: "Edge Cases — ResQNet" },
      { name: "description", content: "Blocked critical route and resource shortage edge cases, with A* re-planning and utility-based triage." },
      { property: "og:title", content: "Edge Cases — ResQNet" },
      { property: "og:description", content: "How ResQNet agents behave when routes fail or resources run out." },
    ],
  }),
  component: EdgePage,
});

const MAP = ["............", "......DD....", "............", "..XXXX.XXX..", "............", "............", "............", "H..........."];
const START = { r: 0, c: 6 }, GOAL = { r: 7, c: 0 }, BLOCK = { r: 3, c: 6 };

const REQS: AllocationRequest[] = [
  { id: "V01", severity: "critical", waitMin: 6, distance: 8 }, { id: "V02", severity: "critical", waitMin: 2, distance: 3 },
  { id: "V03", severity: "serious", waitMin: 12, distance: 4 }, { id: "V04", severity: "critical", waitMin: 9, distance: 14 },
  { id: "V05", severity: "minor", waitMin: 15, distance: 2 }, { id: "V06", severity: "critical", waitMin: 1, distance: 10 },
  { id: "V07", severity: "serious", waitMin: 4, distance: 6 },
];

function EdgePage() {
  const [phase, setPhase] = useState(0);
  const g0 = parseGrid(MAP);
  const g1 = parseGrid(MAP); g1[BLOCK.r][BLOCK.c] = "blocked";
  const a = astar(g0, START, GOAL), b = astar(g1, START, GOAL);
  const run = () => { setPhase(1); setTimeout(() => setPhase(2), 900); setTimeout(() => setPhase(3), 1800); };
  const [kits, setKits] = useState(0);
  const alloc = kits ? allocateByPriority(REQS, kits) : null;

  return (
    <>
      <PageHeader eyebrow="Robustness" title="Edge Cases" subtitle="Situations where naive planning fails and agents must adapt." actions={<SimBadge />} />
      <Panel title="Edge Case 1 · Blocked Critical Route" subtitle="The only short gap in the wall collapses while a critical victim waits at the hospital route" icon={AlertTriangle} actions={<Button size="sm" onClick={run}><Play /> Run Edge Case</Button>}>
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <DisasterMap grid={phase >= 1 ? g1 : g0} start={START} goal={GOAL} explored={phase === 2 ? new Set(b.explored.map((p) => `${p.r},${p.c}`)) : undefined}
            paths={[{ points: a.path, tone: phase >= 1 ? "danger" : "ai", dashed: phase >= 1 }, ...(phase === 3 ? [{ points: b.path, tone: "safe" as const }] : [])]} />
          <div className="space-y-2">
            {["Original route computed", "Road D7 blocked on route", "A* recalculating...", "New route adopted"].map((t, i) => (
              <div key={t} className={cn("rounded-lg border px-3 py-2 text-sm transition-all", phase >= i ? "border-ai/40 bg-ai/5" : "opacity-40")}>{i + 1}. {t}</div>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Stat label="Original cost" value={a.cost} />
              <Stat label="New cost" value={phase === 3 ? b.cost : "—"} />
              <Stat label="Additional cost" value={phase === 3 ? `+${b.cost - a.cost}` : "—"} />
              <Stat label="Re-plan nodes" value={phase >= 2 ? b.explored.length : "—"} />
            </div>
            <p className="text-xs text-muted-foreground">Why: the agent's model becomes invalid; the Path Agent re-runs A* from the current state. Optimality is preserved on the new map, at extra cost.</p>
          </div>
        </div>
      </Panel>

      <Panel title="Edge Case 2 · Resource Shortage" subtitle="7 injured victims, only 3 medical kits" icon={AlertTriangle} className="mt-5" actions={<Button size="sm" onClick={() => setKits(3)}><Play /> Run Edge Case</Button>}>
        <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          <Stat label="Demand" value={REQS.length} /><Stat label="Available" value={3} />
          <Stat label="Served" value={alloc ? alloc.filter((x) => x.allocated).length : "—"} /><Stat label="Unserved" value={alloc ? alloc.filter((x) => !x.allocated).length : "—"} />
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase text-muted-foreground"><tr>{["Rank", "Victim", "Severity", "Wait", "Dist", "Utility", "Decision"].map((h) => <th key={h} className="py-2">{h}</th>)}</tr></thead>
          <tbody>
            {(alloc ?? REQS.map((r) => ({ ...r, rank: 0, score: 0, allocated: false, reason: "" }))).map((r) => (
              <tr key={r.id} className={cn("border-t animate-fade-in", alloc && (r.allocated ? "bg-safe/5" : "bg-danger/5"))}>
                <td className="py-2 font-mono">{r.rank || "—"}</td><td className="font-medium">{r.id}</td><td className="capitalize">{r.severity}</td><td>{r.waitMin}m</td><td>{r.distance}</td>
                <td className="font-mono">{alloc ? r.score : "—"}</td><td className="text-xs">{alloc ? r.reason : "pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-muted-foreground">Why: utility U = w(sev) + 2·wait − 1.5·dist ranks requests; scarce kits go to highest utility. Unserved victims still get rescued, with basic first aid, and are queued for resupply.</p>
      </Panel>
    </>
  );
}
