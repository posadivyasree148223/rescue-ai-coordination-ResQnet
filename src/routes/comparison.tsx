import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, GitCompare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Legend } from "recharts";
import { parseGrid } from "@/lib/grid";
import { astar, type SearchResult } from "@/lib/astar";
import { bfs } from "@/lib/bfs";
import { SCENARIOS } from "@/lib/scenarios";
import { PageHeader, Panel, Stat, SimBadge, chartTip } from "@/components/ui-kit";
import { SearchGrid, useSearchPlayback } from "@/components/SearchVisualizer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/comparison")({
  head: () => ({
    meta: [
      { title: "A* vs BFS Comparison — ResQNet" },
      { name: "description", content: "Run A* and Breadth-First Search side by side on the same disaster map." },
      { property: "og:title", content: "A* vs BFS — ResQNet" },
      { property: "og:description", content: "Compare explored nodes, path cost and memory of A* and BFS." },
    ],
  }),
  component: ComparePage,
});

const grid = parseGrid(SCENARIOS.flood.map);
const S = { r: 7, c: 0 }, G = { r: 0, c: 11 };

function Side({ r, tone }: { r: SearchResult | null; tone: "safe" | "warning" }) {
  const pb = useSearchPlayback(r, 40);
  return (
    <div>
      <SearchGrid grid={grid} result={r} idx={pb.idx} done={pb.done} start={S} goal={G} tone={tone} />
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Explored" value={r ? Math.min(pb.idx, r.explored.length) : "—"} />
        <Stat label="Path cost" value={r && pb.done ? r.cost : "—"} />
        <Stat label="Max frontier" value={r ? r.maxFrontier : "—"} />
      </div>
    </div>
  );
}

function ComparePage() {
  const [res, setRes] = useState<{ a: SearchResult; b: SearchResult } | null>(null);
  const rows = [
    ["Path quality", "Optimal (least cost)", "Fewest steps only — may cross hazards"],
    ["Use of heuristic", "Yes — Manhattan h(n)", "None (uninformed)"],
    ["Search behaviour", "Best-first toward goal", "Level-by-level wavefront"],
    ["Memory", "O(b^d), fewer in practice", "O(b^d), stores whole frontier"],
    ["Suitable environment", "Weighted, dynamic maps", "Uniform-cost, small maps"],
  ];
  return (
    <>
      <PageHeader eyebrow="Evaluation" title="Algorithm Comparison" subtitle="Same flood map, same start and goal — only the search strategy differs." actions={<><SimBadge /><Button onClick={() => setRes({ a: astar(grid, S, G), b: bfs(grid, S, G) })}><Play /> Run Both Algorithms</Button></>} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="A* Search" subtitle="f(n) = g(n) + h(n)" icon={GitCompare}><Side r={res?.a ?? null} tone="safe" /></Panel>
        <Panel title="Breadth-First Search" subtitle="FIFO queue, no heuristic" icon={GitCompare}><Side r={res?.b ?? null} tone="warning" /></Panel>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Metrics">
          <div className="h-56">
            {res ? (
              <ResponsiveContainer>
                <BarChart data={[{ m: "Nodes explored", A: res.a.explored.length, BFS: res.b.explored.length }, { m: "Path cost", A: res.a.cost, BFS: res.b.cost }, { m: "Max frontier", A: res.a.maxFrontier, BFS: res.b.maxFrontier }]}>
                  <XAxis dataKey="m" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} width={30} /><RTooltip {...chartTip} /><Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="A" name="A*" fill="var(--ai)" radius={[4, 4, 0, 0]} /><Bar dataKey="BFS" fill="var(--warning)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="pt-20 text-center text-sm text-muted-foreground">Press "Run Both Algorithms".</p>}
          </div>
        </Panel>
        <Panel title="Conceptual Comparison">
          <table className="w-full text-sm"><thead className="text-left text-[11px] uppercase text-muted-foreground"><tr><th className="py-1.5">Metric</th><th>A*</th><th>BFS</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={r[0]} className="border-t"><td className="py-2 font-medium">{r[0]}</td><td className="text-ai">{r[1]}</td><td className="text-muted-foreground">{r[2]}</td></tr>)}</tbody></table>
          <p className="mt-3 text-xs text-muted-foreground">BFS guarantees the fewest moves, but treats a flooded cell like a dry road, so its route can be more dangerous. A* uses g(n) to price hazards and h(n) to steer toward the goal, exploring fewer states.</p>
        </Panel>
      </div>
    </>
  );
}
