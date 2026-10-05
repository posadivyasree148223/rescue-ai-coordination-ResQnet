export type CellKind = "road" | "blocked" | "hazard" | "hospital" | "depot" | "safe";
export type Pos = { r: number; c: number };
export type Grid = CellKind[][];

export const ROWS = 8;
export const COLS = 12;

export const key = (p: Pos) => `${p.r},${p.c}`;
export const fromKey = (k: string): Pos => {
  const [r, c] = k.split(",").map(Number);
  return { r, c };
};
export const label = (p: Pos) => `${String.fromCharCode(65 + p.r)}${p.c + 1}`;
export const samePos = (a: Pos, b: Pos) => a.r === b.r && a.c === b.c;

const CHAR: Record<string, CellKind> = {
  ".": "road",
  X: "blocked",
  D: "hazard",
  H: "hospital",
  R: "depot",
  S: "safe",
};

export function parseGrid(rows: string[]): Grid {
  return rows.map((row) => row.split("").map((ch) => CHAR[ch] ?? "road"));
}

export const passable = (k: CellKind) => k !== "blocked";
/** Movement cost to ENTER a cell. Hazard (disaster) cells are passable but dangerous. */
export const cellCost = (k: CellKind) => (k === "hazard" ? 3 : 1);

const DIRS = [
  { r: -1, c: 0 },
  { r: 0, c: 1 },
  { r: 1, c: 0 },
  { r: 0, c: -1 },
];

export function neighbors(grid: Grid, p: Pos): Pos[] {
  const out: Pos[] = [];
  for (const d of DIRS) {
    const n = { r: p.r + d.r, c: p.c + d.c };
    if (n.r < 0 || n.c < 0 || n.r >= grid.length || n.c >= grid[0].length) continue;
    if (!passable(grid[n.r][n.c])) continue;
    out.push(n);
  }
  return out;
}

export const manhattan = (a: Pos, b: Pos) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

export function pathCost(grid: Grid, path: Pos[]) {
  let cost = 0;
  for (let i = 1; i < path.length; i++) cost += cellCost(grid[path[i].r][path[i].c]);
  return cost;
}

export function findCells(grid: Grid, kind: CellKind): Pos[] {
  const out: Pos[] = [];
  grid.forEach((row, r) => row.forEach((k, c) => k === kind && out.push({ r, c })));
  return out;
}
