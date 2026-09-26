import { createFileRoute } from "@tanstack/react-router";
import { Network, Table2 } from "lucide-react";
import { useSim } from "@/lib/sim-store";
import type { AgentKind } from "@/lib/simulation";
import { PageHeader, Panel, SimBadge, StatusPill } from "@/components/ui-kit";
import { AgentIcon, AGENT_TONE } from "@/components/AgentIcon";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agent Network — ResQNet" },
      { name: "description", content: "The six cooperating AI agents in ResQNet: goals, sensors, actions and live communication." },
      { property: "og:title", content: "ResQNet Multi-Agent Network" },
      { property: "og:description", content: "Recon, Rescue, Medical, Logistics, Path Planning and Coordination agents working together." },
    ],
  }),
  component: AgentsPage,
});

export const AGENT_SPECS: { kind: AgentKind; name: string; goal: string; sensors: string; actions: string; type: string }[] = [
  { kind: "recon", name: "Reconnaissance Agent", goal: "Detect victims and identify hazards.", sensors: "Drone imagery, hazard reports, environment state.", actions: "Scan zones, identify victims, update map.", type: "Model-based reflex" },
  { kind: "rescue", name: "Rescue Agent", goal: "Reach victims and perform rescue.", sensors: "Map, victim locations, hazard information.", actions: "Move, rescue, reroute.", type: "Goal-based" },
  { kind: "medical", name: "Medical Agent", goal: "Prioritise victims according to severity.", sensors: "Victim condition, medical resources.", actions: "Assign medical resources, prioritise treatment.", type: "Utility-based" },
  { kind: "logistics", name: "Logistics Agent", goal: "Manage and allocate limited resources.", sensors: "Resource inventory, agent requirements.", actions: "Allocate supplies, redirect resources.", type: "Utility-based" },
  { kind: "path", name: "Path Planning Agent", goal: "Find efficient safe routes.", sensors: "Grid/map, blocked paths, hazard costs.", actions: "Calculate and update routes (A*).", type: "Goal-based (search)" },
  { kind: "coord", name: "Coordination Agent", goal: "Coordinate all other agents.", sensors: "Global simulation state.", actions: "Resolve conflicts, prioritise and assign tasks.", type: "Utility-based" },
];

const POS: Record<AgentKind, [number, number]> = { coord: [50, 50], recon: [50, 10], rescue: [86, 30], medical: [86, 72], logistics: [50, 90], path: [14, 50] };
const LINKS: [AgentKind, AgentKind, string][] = [
  ["recon", "coord", "victim & hazard reports"], ["coord", "rescue", "task assignment"], ["coord", "path", "route request"], ["path", "rescue", "A* route"],
  ["medical", "coord", "triage priority"], ["logistics", "rescue", "supplies"], ["medical", "logistics", "resource demand"], ["recon", "path", "map updates"],
];

function AgentsPage() {
  const { sim } = useSim();
  const busy = (k: AgentKind) => k === "recon" || k === "rescue" ? sim.status === "running" : sim.soft[k as "medical"].status !== "STANDBY";
  const rows = [
    ...sim.agents.map((a) => ({ id: a.id, kind: a.type as AgentKind, name: a.name, task: a.task, status: a.status, res: a.type === "rescue" ? (a.target ? "Vehicle, equipment" : "—") : "Drone battery", comm: a.type === "recon" ? "→ Coord, Path" : "← Coord, Path" })),
    ...(["medical", "logistics", "path", "coord"] as const).map((k) => ({ id: k.toUpperCase().slice(0, 3), kind: k as AgentKind, name: AGENT_SPECS.find((s) => s.kind === k)!.name, task: sim.soft[k].task, status: sim.soft[k].status, res: k === "logistics" ? `${sim.resources.medicalKits.total - sim.resources.medicalKits.allocated} kits` : "—", comm: k === "coord" ? "↔ all agents" : "↔ Coord" })),
  ];

  return (
    <>
      <PageHeader eyebrow="Multi-Agent System" title="Agent Network" subtitle="Six autonomous agents with distinct goals cooperate through a coordination hub. Lines animate while the simulation runs." actions={<SimBadge />} />
      <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
        <Panel title="Communication Topology" subtitle="Message flows between agents" icon={Network}>
          <div className="relative mx-auto aspect-square max-w-[520px]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
              {LINKS.map(([a, b, l]) => {
                const [x1, y1] = POS[a], [x2, y2] = POS[b];
                return (
                  <g key={a + b}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ai)" strokeOpacity={0.35} strokeWidth={0.4} className={sim.status === "running" ? "flow-line" : ""} />
                    <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 1} fontSize={2.2} textAnchor="middle" fill="var(--muted-foreground)">{l}</text>
                  </g>
                );
              })}
            </svg>
            {AGENT_SPECS.map((s) => (
              <div key={s.kind} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${POS[s.kind][0]}%`, top: `${POS[s.kind][1]}%` }}>
                <div className={cn("mx-auto grid size-14 place-items-center rounded-2xl border bg-card shadow-card transition-transform hover:scale-105", s.kind === "coord" && "size-16 border-ai")}>
                  <span className={cn("grid size-10 place-items-center rounded-xl", AGENT_TONE[s.kind])}><AgentIcon kind={s.kind} className="size-5" /></span>
                </div>
                <p className="mt-1.5 whitespace-nowrap text-[11px] font-semibold">{s.name.replace(" Agent", "")}</p>
                <span className={cn("mx-auto mt-0.5 block size-1.5 rounded-full", busy(s.kind) ? "bg-safe animate-pulse" : "bg-muted-foreground/40")} />
              </div>
            ))}
          </div>
        </Panel>
        <div className="grid gap-3 sm:grid-cols-2">
          {AGENT_SPECS.map((s) => (
            <div key={s.kind} className="rounded-xl border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5">
              <div className="mb-2 flex items-center gap-2.5">
                <span className={cn("grid size-8 place-items-center rounded-lg", AGENT_TONE[s.kind])}><AgentIcon kind={s.kind} /></span>
                <div><p className="text-[13px] font-semibold">{s.name}</p><p className="font-mono text-[10px] uppercase text-muted-foreground">{s.type}</p></div>
              </div>
              <dl className="space-y-1 text-xs">
                <div><dt className="inline font-semibold">Goal: </dt><dd className="inline text-muted-foreground">{s.goal}</dd></div>
                <div><dt className="inline font-semibold">Sensors: </dt><dd className="inline text-muted-foreground">{s.sensors}</dd></div>
                <div><dt className="inline font-semibold">Actions: </dt><dd className="inline text-muted-foreground">{s.actions}</dd></div>
              </dl>
            </div>
          ))}
        </div>
      </div>

      <Panel title="Live Agent Status" subtitle="Updates every simulation tick" icon={Table2} className="mt-5" bodyClass="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>{["Agent", "Role", "Current Task", "Status", "Resources", "Communication"].map((h) => <th key={h} className="px-5 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id + r.name} className="border-t transition-colors hover:bg-muted/30">
                <td className="px-5 py-3"><div className="flex items-center gap-2"><span className={cn("grid size-7 place-items-center rounded-md", AGENT_TONE[r.kind])}><AgentIcon kind={r.kind} className="size-3.5" /></span><span className="font-medium">{r.name}</span></div></td>
                <td className="px-5 py-3 text-muted-foreground">{AGENT_SPECS.find((s) => s.kind === r.kind)!.goal}</td>
                <td className="px-5 py-3">{r.task}</td>
                <td className="px-5 py-3"><StatusPill status={r.status} /></td>
                <td className="px-5 py-3 font-mono text-xs">{r.res}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{r.comm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
