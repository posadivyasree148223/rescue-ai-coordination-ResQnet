import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, SkipForward, RotateCcw, Route as RouteIcon, GitBranch, ListOrdered, BarChart3, Ban, Flag, MapPin } from "lucide-react";
import { parseGrid, type Pos, type Grid, samePos } from "@/lib/grid";
import { astar, type SearchResult } from "@/lib/astar";
import { SCENARIOS } from "@/lib/scenarios";
import { PageHeader, Panel, Formula, Stat, SimBadge } from "@/components/ui-kit";
import { SearchGrid, SearchTree, StateSequence, PathSequence, useSearchPlayback } from "@/components/SearchVisualizer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "A* Search & Path Planning — ResQNet" },
      { name: "description", content: "Interactive A* search visualisation with f(n)=g(n)+h(n), explored states, frontier and state-space tree." },
      { property: "og:title", content: "A* Search Visualisation — ResQNet" },
      { property: "og:description", content: "Watch A* explore the disaster grid state by state and build the search tree." },
    ],
  }),
  component: SearchPage,
});

type Tool = "start" | "goal" | "block";

function SearchPage() {
  const [grid, setGrid] = useState<Grid>(() => parseGrid(SCENARIOS.earthquake.map));
  const [start, setStart] = useState<Pos>({ r: 7, c: 0 });
  const [goal, setGoal] = useState<Pos>({ r: 1, c: 7 });
  const [tool, setTool] = useState<Tool>("block");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [speed, setSpeed] = useState(90);
  const pb = useSearchPlayback(result, speed);

  const run = () => {
    const r = astar(grid, start, goal);
    setResult(r);
    toast.info(r.found ? `A* found a path of cost ${r.cost} after expanding ${r.explored.length} nodes` : "A* exhausted the frontier — no path exists");
  };

  const onCell = (p: Pos) => {
    setResult(null);
    if (tool === "start" && grid[p.r][p.c] !== "blocked") setStart(p);
    else if (tool === "goal" && grid[p.r][p.c] !== "blocked") setGoal(p);
    else if (tool === "block" && !samePos(p, start) && !samePos(p, goal)) {
      setGrid((g) => g.map((row, r) => row.map((k, c) => (r === p.r && c === p.c ? (k === "blocked" ? "road" : "blocked") : k))));
    }
  };

  return (
    <>
      <PageHeader eyebrow="Search Technique" title="Search & Path Planning" subtitle="Rescue agents must find low-cost routes while avoiding blocked roads and penalising hazardous cells. A* is informed, complete and optimal with an admissible heuristic." actions={<SimBadge />} />

      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 shadow-card md:col-span-2">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Evaluation function</p>
          <Formula>f(n) = g(n) + h(n)</Formula>
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            <li><b className="font-mono text-foreground">g(n)</b> — actual cost from start (road = 1, disaster zone = 3)</li>
            <li><b className="font-mono text-foreground">h(n)</b> — Manhattan distance to goal (admissible: never over-estimates)</li>
            <li><b className="font-mono text-foreground">f(n)</b> — estimated total cost; lowest f is expanded first</li>
          </ul>
        </div>
        <div className="rounded-xl border bg-card p-4 text-xs shadow-card md:col-span-2">
          <p className="mb-2 font-medium text-muted-foreground">Why A* for ResQNet?</p>
          <p className="leading-relaxed text-muted-foreground">Every second matters, so routes must be <b className="text-foreground">optimal</b>, but the agent also needs answers <b className="text-foreground">fast</b> when roads collapse. The heuristic focuses expansion toward the victim, exploring far fewer states than uninformed search, while cell costs let agents avoid dangerous zones rather than simply counting steps.</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Panel title="Search Visualization" subtitle="Blue = explored (closed) · amber = frontier (open) · green = final path" icon={RouteIcon}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Button onClick={run}><Play /> Run A* Search</Button>
            <Button variant="outline" onClick={pb.skip} disabled={!result || pb.done}><SkipForward /> Skip</Button>
            <Button variant="outline" onClick={pb.replay} disabled={!result}><RotateCcw /> Replay</Button>
            <div className="ml-auto flex gap-1 rounded-lg bg-muted/50 p-1 text-xs">
              {([["start", MapPin, "Set start"], ["goal", Flag, "Set goal"], ["block", Ban, "Toggle obstacle"]] as const).map(([t, I, l]) => (
                <button key={t} onClick={() => setTool(t)} className={cn("flex items-center gap-1 rounded-md px-2 py-1.5", tool === t ? "bg-card font-semibold shadow-card" : "")}><I className="size-3.5" />{l}</button>
              ))}
            </div>
          </div>
          <SearchGrid grid={grid} result={result} idx={pb.idx} done={pb.done} start={start} goal={goal} onCellClick={onCell} />
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            Animation speed
            {[[160, "Slow"], [90, "Normal"], [30, "Fast"]].map(([v, l]) => <button key={l} onClick={() => setSpeed(v as number)} className={cn("rounded px-2 py-0.5", speed === v ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>{l}</button>)}
          </div>
        </Panel>
        <div className="space-y-5">
          <Panel title="Search Statistics" icon={BarChart3}>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Nodes explored" value={result ? Math.min(pb.idx, result.explored.length) : "—"} />
              <Stat label="Path cost" value={result && pb.done ? (result.found ? result.cost : "∞") : "—"} />
              <Stat label="Search depth" value={result && pb.done ? result.depth : "—"} />
              <Stat label="Branching factor" value="≤ 4" />
              <Stat label="Execution steps" value={result ? pb.idx : "—"} />
              <Stat label="Max frontier" value={result ? result.maxFrontier : "—"} />
            </div>
          </Panel>
          <Panel title="Final Path" icon={RouteIcon}>
            {result && pb.done ? <PathSequence path={result.path} /> : <p className="text-xs text-muted-foreground">Appears when the goal is popped from the open list.</p>}
          </Panel>
          <Panel title="Sequence of States Explored" subtitle="Order of expansion (closed list)" icon={ListOrdered}>
            {result ? <StateSequence result={result} idx={pb.idx} /> : <p className="text-xs text-muted-foreground">Click "Run A* Search".</p>}
          </Panel>
        </div>
      </div>

      <Panel title="State-Space Exploration" subtitle="Search tree built from A* parent pointers (first 36 expansions shown)" icon={GitBranch} className="mt-5">
        <p className="mb-3 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          The search space represents possible agent movements from the initial state to the rescue destination. Each node is a grid cell (state); each edge is a move action. A* prioritises states using <span className="font-mono text-ai">f(n)=g(n)+h(n)</span>.
          <span className="ml-2 inline-flex flex-wrap gap-2">
            <span className="rounded bg-ai/10 px-1.5 text-ai">explored</span><span className="rounded px-1.5 text-muted-foreground ring-1 ring-border">frontier / unexplored</span><span className="rounded bg-safe/15 px-1.5 text-safe">optimal path</span><span className="rounded bg-safe px-1.5 text-primary-foreground">goal</span>
          </span>
        </p>
        {result ? <SearchTree result={result} idx={pb.idx} /> : <p className="text-sm text-muted-foreground">Run A* to grow the tree.</p>}
      </Panel>
    </>
  );
}
