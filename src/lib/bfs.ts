import { type Grid, type Pos, key, neighbors, manhattan, pathCost, samePos } from "./grid";
import { reconstruct, type SearchResult } from "./astar";

/** Breadth-First Search: uninformed, expands by depth (number of moves), ignores cell cost. */
export function bfs(grid: Grid, start: Pos, goal: Pos): SearchResult {
  const parents: Record<string, string | null> = { [key(start)]: null };
  const g: Record<string, number> = { [key(start)]: 0 };
  const h: Record<string, number> = {};
  const queue: Pos[] = [start];
  const explored: Pos[] = [];
  let maxFrontier = 1;
  let generated = 1;

  while (queue.length) {
    const cur = queue.shift()!;
    explored.push(cur);
    h[key(cur)] = manhattan(cur, goal);
    if (samePos(cur, goal)) {
      const path = reconstruct(parents, goal);
      return { algorithm: "BFS", found: true, path, cost: pathCost(grid, path), depth: path.length - 1, explored, parents, g, h, maxFrontier, generated };
    }
    for (const n of neighbors(grid, cur)) {
      const nk = key(n);
      if (nk in parents) continue;
      parents[nk] = key(cur);
      g[nk] = g[key(cur)] + 1;
      queue.push(n);
      generated++;
    }
    maxFrontier = Math.max(maxFrontier, queue.length);
  }
  return { algorithm: "BFS", found: false, path: [], cost: Infinity, depth: 0, explored, parents, g, h, maxFrontier, generated };
}
