import { useEffect, useMemo, useState } from "react";
import { type Grid, type Pos, key, label } from "@/lib/grid";
import type { SearchResult } from "@/lib/astar";
import { DisasterMap } from "./DisasterMap";

export function useSearchPlayback(result: SearchResult | null, msPerStep = 60) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { setIdx(0); setPlaying(!!result); }, [result]);
  useEffect(() => {
    if (!playing || !result) return;
    if (idx >= result.explored.length) { setPlaying(false); return; }
    const t = setTimeout(() => setIdx((i) => i + 1), msPerStep);
    return () => clearTimeout(t);
  }, [playing, idx, result, msPerStep]);
  const done = !!result && idx >= result.explored.length;
  return { idx, done, playing, skip: () => result && setIdx(result.explored.length), replay: () => { setIdx(0); setPlaying(true); } };
}

export function SearchGrid({ grid, result, idx, done, start, goal, onCellClick, tone = "safe" }: { grid: Grid; result: SearchResult | null; idx: number; done: boolean; start: Pos; goal: Pos; onCellClick?: (p: Pos) => void; tone?: "safe" | "ai" | "warning" }) {
  const { explored, frontier, current } = useMemo(() => {
    if (!result) return { explored: new Set<string>(), frontier: new Set<string>(), current: null };
    const ex = result.explored.slice(0, idx);
    const exSet = new Set(ex.map(key));
    const fr = new Set<string>();
    for (const [k, p] of Object.entries(result.parents)) if (p && exSet.has(p) && !exSet.has(k)) fr.add(k);
    return { explored: exSet, frontier: fr, current: ex[ex.length - 1] ?? null };
  }, [result, idx]);
  return (
    <DisasterMap
      grid={grid}
      explored={explored}
      frontier={done ? undefined : frontier}
      current={done ? null : current}
      start={start}
      goal={goal}
      paths={done && result?.found ? [{ points: result.path, tone }] : []}
      onCellClick={onCellClick}
    />
  );
}

export function StateSequence({ result, idx }: { result: SearchResult; idx: number }) {
  const seq = result.explored.slice(0, idx);
  return (
    <div className="flex max-h-28 flex-wrap gap-1 overflow-y-auto font-mono text-[11px]">
      {seq.map((p, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="rounded bg-ai/10 px-1.5 py-0.5 text-ai">{label(p)}</span>
          {i < seq.length - 1 && <span className="text-muted-foreground">→</span>}
        </span>
      ))}
      {!seq.length && <span className="text-muted-foreground">Run the search to see the sequence of states expanded.</span>}
    </div>
  );
}

export function PathSequence({ path }: { path: Pos[] }) {
  if (!path.length) return <p className="text-xs text-muted-foreground">No path found.</p>;
  return (
    <p className="font-mono text-xs leading-relaxed">
      {path.map((p, i) => (
        <span key={i}>
          <span className={i === 0 ? "font-bold text-ai" : i === path.length - 1 ? "font-bold text-safe" : ""}>{i === 0 ? `S(${label(p)})` : i === path.length - 1 ? `Goal(${label(p)})` : label(p)}</span>
          {i < path.length - 1 && <span className="text-muted-foreground"> → </span>}
        </span>
      ))}
    </p>
  );
}

interface TNode { k: string; children: TNode[] }

/** Renders the explored portion of the state space as a tree built from A* parent pointers. */
export function SearchTree({ result, idx, limit = 36 }: { result: SearchResult; idx: number; limit?: number }) {
  const { root, pathSet, exploredSet, goalK } = useMemo(() => {
    const shown = result.explored.slice(0, Math.min(idx, limit)).map(key);
    const exploredSet = new Set(shown);
    const pathSet = new Set(idx >= result.explored.length ? result.path.map(key) : []);
    const goalK = result.path.length ? key(result.path[result.path.length - 1]) : "";
    const nodes = new Map<string, TNode>();
    const get = (k: string) => { if (!nodes.has(k)) nodes.set(k, { k, children: [] }); return nodes.get(k)!; };
    let root: TNode | null = null;
    // include explored nodes + their generated (unexplored) children
    const include = new Set(shown);
    for (const [k, p] of Object.entries(result.parents)) if (p && exploredSet.has(p)) include.add(k);
    if (idx >= result.explored.length) for (const k of pathSet) include.add(k);
    for (const k of include) {
      const n = get(k);
      const p = result.parents[k];
      if (p === null) root = n;
      else if (p && include.has(p)) get(p).children.push(n);
    }
    return { root, pathSet, exploredSet, goalK };
  }, [result, idx, limit]);

  if (!root) return <p className="text-sm text-muted-foreground">Run a search to build the state-space tree.</p>;

  const render = (n: TNode, prefix: string, last: boolean, isRoot: boolean): React.ReactNode => {
    const p = { r: +n.k.split(",")[0], c: +n.k.split(",")[1] };
    const g = result.g[n.k] ?? 0, h = result.h[n.k] ?? 0;
    const cls = n.k === goalK && pathSet.has(n.k) ? "bg-safe text-primary-foreground" : pathSet.has(n.k) ? "bg-safe/15 text-safe font-semibold" : exploredSet.has(n.k) ? "bg-ai/10 text-ai" : "text-muted-foreground";
    const kids = [...n.children].sort((a, b) => (pathSet.has(b.k) ? 1 : 0) - (pathSet.has(a.k) ? 1 : 0));
    return (
      <div key={n.k}>
        <div className="flex items-center whitespace-pre font-mono text-[11px] leading-5">
          <span className="text-muted-foreground/60">{isRoot ? "" : prefix + (last ? "└── " : "├── ")}</span>
          <span className={`rounded px-1.5 ${cls}`}>{isRoot ? `Start ${label(p)}` : label(p)}</span>
          <span className="ml-2 text-[10px] text-muted-foreground">f={g + h} (g={g}, h={h}){!exploredSet.has(n.k) && !pathSet.has(n.k) ? " · frontier" : ""}</span>
        </div>
        {kids.map((c, i) => render(c, isRoot ? "" : prefix + (last ? "    " : "│   "), i === kids.length - 1, false))}
      </div>
    );
  };
  return <div className="max-h-[420px] overflow-auto rounded-lg bg-muted/40 p-3">{render(root, "", true, true)}</div>;
}
