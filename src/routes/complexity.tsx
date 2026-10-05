import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sigma } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { PageHeader, Panel, Formula, Stat, SimBadge, chartTip } from "@/components/ui-kit";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/complexity")({
  head: () => ({
    meta: [
      { title: "Complexity Analysis — ResQNet" },
      { name: "description", content: "Time and space complexity of A* search, O(b^d), with an interactive growth chart." },
      { property: "og:title", content: "A* Complexity Analysis — ResQNet" },
      { property: "og:description", content: "Explore how branching factor and depth drive search-space growth." },
    ],
  }),
  component: ComplexityPage,
});

function ComplexityPage() {
  const [b, setB] = useState(4);
  const [d, setD] = useState(10);
  const eff = 1 + (b - 1) * 0.35;
  const data = Array.from({ length: d }, (_, i) => ({ depth: i + 1, space: Math.round(b ** (i + 1)), astar: Math.max(1, Math.round(eff ** (i + 1))) }));
  return (
    <>
      <PageHeader eyebrow="Analysis" title="Complexity Analysis" subtitle="As the search space grows, the number of possible states can increase rapidly." actions={<SimBadge />} />
      <div className="mb-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-card"><p className="mb-2 text-xs text-muted-foreground">Time complexity (worst case)</p><Formula>O(b^d)</Formula></div>
        <div className="rounded-xl border bg-card p-5 shadow-card"><p className="mb-2 text-xs text-muted-foreground">Space complexity (keeps all generated nodes)</p><Formula>O(b^d)</Formula></div>
      </div>
      <Panel title="Search Space Size vs Nodes Explored" subtitle="Log scale · b = branching factor, d = solution depth" icon={Sigma}>
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <div className="space-y-5">
            <div><p className="mb-2 text-xs font-medium">Branching factor b = {b}</p><Slider min={2} max={8} value={[b]} onValueChange={([v]) => setB(v)} /></div>
            <div><p className="mb-2 text-xs font-medium">Search depth d = {d}</p><Slider min={2} max={16} value={[d]} onValueChange={([v]) => setD(v)} /></div>
            <Stat label="b^d (full space)" value={(b ** d).toExponential(2)} />
            <Stat label={`A* effective b* ≈ ${eff.toFixed(2)}`} value={Math.round(eff ** d).toLocaleString()} />
            <p className="text-xs text-muted-foreground">Practical performance depends heavily on the heuristic: a good h(n) reduces the effective branching factor b*. On our 8×12 grid A* never exceeds 96 states.</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="depth" tick={{ fontSize: 11 }} />
                <YAxis scale="log" domain={[1, "auto"]} tick={{ fontSize: 11 }} width={60} tickFormatter={(v) => Number(v).toExponential(0)} />
                <RTooltip {...chartTip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line dataKey="space" name="Search space b^d" stroke="var(--danger)" strokeWidth={2} dot={false} />
                <Line dataKey="astar" name="A* nodes (b*^d)" stroke="var(--ai)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Panel>
    </>
  );
}
