import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, HeartPulse, ShieldCheck, Boxes, Flame, Timer, Map as MapIcon, Activity, Play, Pause, ArrowRight, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { useSim } from "@/lib/sim-store";
import { metrics } from "@/lib/simulation";
import { PageHeader, Panel, Metric, SimBadge, StatusPill } from "@/components/ui-kit";
import { DisasterMap, MapLegend } from "@/components/DisasterMap";
import { DecisionFeed } from "@/components/DecisionFeed";
import { AgentIcon } from "@/components/AgentIcon";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Center — ResQNet AI Disaster Response" },
      { name: "description", content: "Live command center for a multi-agent AI disaster rescue simulation: agents, victims, resources and decisions." },
      { property: "og:title", content: "ResQNet Command Center" },
      { property: "og:description", content: "Watch AI agents coordinate a simulated disaster rescue operation in real time." },
    ],
  }),
  component: Dashboard,
});

export const chartTip = { contentStyle: { borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 } };

function Dashboard() {
  const { sim, start, pause } = useSim();
  const m = metrics(sim);
  const active = sim.agents.length + 4;
  const zones = new Set(sim.grid.flatMap((row, r) => row.map((k, c) => (k === "hazard" ? `${Math.floor(r / 3)}-${Math.floor(c / 4)}` : null)).filter(Boolean))).size;
  const workload = [
    ...sim.agents.map((a) => ({ name: a.id, tasks: a.tasksDone, moves: a.distance })),
    ...(["medical", "logistics", "path", "coord"] as const).map((k) => ({ name: k[0].toUpperCase() + k.slice(1), tasks: sim.soft[k].actions, moves: 0 })),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Disaster Response Command Center"
        subtitle="Multi-Agent AI Coordination & Dynamic Resource Allocation"
        actions={
          <>
            <SimBadge />
            {sim.status === "running" ? (
              <Button onClick={pause} variant="outline"><Pause /> Pause</Button>
            ) : (
              <Button onClick={start} disabled={sim.status === "completed"}><Play /> {sim.tick ? "Resume" : "Start Simulation"}</Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Active Agents" value={active} hint="2 physical · 4 software" icon={Users} tone="ai" />
        <Metric label="Victims Detected" value={`${m.detected}/${m.total}`} hint="via recon sweep" icon={HeartPulse} tone="warning" />
        <Metric label="Victims Rescued" value={m.rescued} hint={`${Math.round((m.rescued / m.total) * 100)}% of total`} icon={ShieldCheck} tone="safe" />
        <Metric label="Resources Available" value={`${m.resources}%`} hint="avg. remaining stock" icon={Boxes} tone="ai" />
        <Metric label="Critical Zones" value={zones} hint={`${m.critical} critical victims open`} icon={Flame} tone="danger" />
        <Metric label="Avg. Rescue Time" value={m.avgRescue ? `${m.avgRescue.toFixed(1)}m` : "—"} hint="detection → hospital" icon={Timer} tone="primary" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
        <Panel title="Live Disaster Map" subtitle="Agents move along A*-computed routes (dashed lines)" icon={MapIcon} actions={<Link to="/simulation" className="flex items-center gap-1 text-xs font-medium text-ai hover:underline">Open simulation <ArrowRight className="size-3" /></Link>}>
          <DisasterMap grid={sim.grid} agents={sim.agents} victims={sim.victims} paths={sim.agents.filter((a) => a.path.length).map((a) => ({ points: [a.pos, ...a.path], tone: a.status === "TRANSPORTING" ? "safe" : "ai" }))} />
          <div className="mt-4"><MapLegend /></div>
        </Panel>
        <Panel title="Agent Roster" subtitle="Current task per agent" icon={Users} bodyClass="p-3">
          <ul className="space-y-1.5">
            {sim.agents.map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/60">
                <span className="grid size-8 place-items-center rounded-lg bg-muted"><AgentIcon kind={a.type} /></span>
                <div className="min-w-0 flex-1"><p className="text-[13px] font-medium">{a.name}</p><p className="truncate text-xs text-muted-foreground">{a.task}</p></div>
                <StatusPill status={a.status} />
              </li>
            ))}
            {(["medical", "logistics", "path", "coord"] as const).map((k) => (
              <li key={k} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/60">
                <span className="grid size-8 place-items-center rounded-lg bg-muted"><AgentIcon kind={k} /></span>
                <div className="min-w-0 flex-1"><p className="text-[13px] font-medium capitalize">{k === "coord" ? "Coordination" : k === "path" ? "Path Planning" : k} Agent</p><p className="truncate text-xs text-muted-foreground">{sim.soft[k].task}</p></div>
                <StatusPill status={sim.soft[k].status} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel title="AI Coordination Status" subtitle="Latest decisions from all agents" icon={Activity} actions={<Link to="/log" className="text-xs font-medium text-ai hover:underline">Full log</Link>}>
          <DecisionFeed decisions={sim.decisions} limit={7} compact />
        </Panel>
        <div className="grid gap-5">
          <Panel title="Victims Rescued Over Time" icon={BarChart3}>
            <div className="h-44">
              <ResponsiveContainer>
                <AreaChart data={sim.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="tick" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={24} />
                  <RTooltip {...chartTip} />
                  <Area type="monotone" dataKey="detected" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.12} isAnimationActive={false} />
                  <Area type="monotone" dataKey="rescued" stroke="var(--safe)" fill="var(--safe)" fillOpacity={0.2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel title="Agent Workload" subtitle="Tasks completed / actions taken" icon={BarChart3}>
            <div className="h-44">
              <ResponsiveContainer>
                <BarChart data={workload}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={24} allowDecimals={false} />
                  <RTooltip {...chartTip} />
                  <Bar dataKey="tasks" fill="var(--ai)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
