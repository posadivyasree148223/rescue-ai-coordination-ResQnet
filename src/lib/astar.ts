import { type Grid, type Pos, key, fromKey, neighbors, manhattan, cellCost, samePos } from "./grid";

export interface SearchResult {
  algorithm: "A*" | "BFS";
  found: boolean;
  path: Pos[];
  cost: number;
  depth: number;
  /** Nodes in the order they were expanded (popped from the frontier). */
  explored: Pos[];
  parents: Record<string, string | null>;
  g: Record<string, number>;
  h: Record<string, number>;
  maxFrontier: number;
  generated: number;
}

export function reconstruct(parents: Record<string, string | null>, goal: Pos): Pos[] {
  const path: Pos[] = [];
  let k: string | null = key(goal);
  while (k) {
    path.unshift(fromKey(k));
    k = parents[k] ?? null;
  }
  return path;
}

/** A* search on a 4-connected grid. f(n) = g(n) + h(n), h = Manhattan distance (admissible). */
export function astar(grid: Grid, start: Pos, goal: Pos): SearchResult {
  const g: Record<string, number> = { [key(start)]: 0 };
  const h: Record<string, number> = { [key(start)]: manhattan(start, goal) };
  const parents: Record<string, string | null> = { [key(start)]: null };
  const open: Pos[] = [start];
  const closed = new Set<string>();
  const explored: Pos[] = [];
  let maxFrontier = 1;
  let generated = 1;

  while (open.length) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) {
      const a = open[i], b = open[bi];
      const fa = g[key(a)] + h[key(a)], fb = g[key(b)] + h[key(b)];
      if (fa < fb || (fa === fb && h[key(a)] < h[key(b)])) bi = i;
    }
    const cur = open.splice(bi, 1)[0];
    const ck = key(cur);
    if (closed.has(ck)) continue;
    closed.add(ck);
    explored.push(cur);

    if (samePos(cur, goal)) {
      const path = reconstruct(parents, goal);
      return { algorithm: "A*", found: true, path, cost: g[ck], depth: path.length - 1, explored, parents, g, h, maxFrontier, generated };
    }

    for (const n of neighbors(grid, cur)) {
      const nk = key(n);
      if (closed.has(nk)) continue;
      const tentative = g[ck] + cellCost(grid[n.r][n.c]);
      if (g[nk] === undefined || tentative < g[nk]) {
        g[nk] = tentative;
        h[nk] = manhattan(n, goal);
        parents[nk] = ck;
        open.push(n);
        generated++;
      }
    }
    maxFrontier = Math.max(maxFrontier, open.length);
  }
  return { algorithm: "A*", found: false, path: [], cost: Infinity, depth: 0, explored, parents, g, h, maxFrontier, generated };
}
