import { type Grid, type Pos, parseGrid, key, label, samePos, manhattan, findCells, ROWS, COLS } from "./grid";
import { astar, type SearchResult } from "./astar";
import { SCENARIOS, type ScenarioId, type ResKey } from "./scenarios";
import { SEVERITY_WEIGHT, type Severity } from "./resourceAllocation";

export type AgentKind = "recon" | "rescue" | "medical" | "logistics" | "path" | "coord";
export type DecisionLevel = "info" | "warn" | "critical" | "success";

export interface Agent {
  id: string;
  name: string;
  type: "recon" | "rescue";
  pos: Pos;
  path: Pos[];
  task: string;
  status: "IDLE" | "SCANNING" | "MOVING" | "RESCUING" | "TRANSPORTING";
  target?: string;
  carrying?: string;
  waypoint: number;
  tasksDone: number;
  distance: number;
}

export interface Victim {
  id: string;
  pos: Pos;
  severity: Severity;
  status: "undetected" | "detected" | "assigned" | "rescued";
  detectedAt?: number;
  rescuedAt?: number;
  kit: boolean;
  unreachable: boolean;
}

export interface Decision {
  seq: number;
  tick: number;
  time: string;
  agent: AgentKind;
  msg: string;
  level: DecisionLevel;
  toast?: boolean;
}

export interface Resource { total: number; allocated: number }

export interface SoftAgent { task: string; status: string; actions: number }

export interface SimState {
  scenarioId: ScenarioId;
  grid: Grid;
  agents: Agent[];
  victims: Victim[];
  resources: Record<ResKey, Resource>;
  tick: number;
  status: "idle" | "running" | "paused" | "completed";
  speed: number;
  severity: 1 | 2 | 3;
  seed: number;
  seq: number;
  decisions: Decision[];
  history: { tick: number; time: string; rescued: number; detected: number; resources: number }[];
  lastSearch: { result: SearchResult; agentId: string; from: Pos; to: Pos; purpose: string } | null;
  stats: { searches: number; nodesExplored: number; reroutes: number; rescueTimes: number[] };
  soft: Record<"medical" | "logistics" | "path" | "coord", SoftAgent>;
  sweepDone: boolean;
}

export const TICK_SECONDS = 15;
export const clock = (tick: number) => {
  const s = 10 * 3600 + tick * TICK_SECONDS;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

const SWEEP: Pos[] = [
  { r: 1, c: 1 }, { r: 1, c: 10 }, { r: 4, c: 10 }, { r: 4, c: 1 }, { r: 6, c: 1 }, { r: 6, c: 10 },
];

export const AGENT_META: Record<AgentKind, { name: string; short: string }> = {
  recon: { name: "Recon Agent", short: "Recon" },
  rescue: { name: "Rescue Agent", short: "Rescue" },
  medical: { name: "Medical Agent", short: "Medical" },
  logistics: { name: "Logistics Agent", short: "Logistics" },
  path: { name: "Path Planning Agent", short: "Path" },
  coord: { name: "Coordination Agent", short: "Coord" },
};

export function createSim(id: ScenarioId, overrides?: Partial<Pick<SimState, "speed" | "severity">>): SimState {
  const def = SCENARIOS[id];
  const agents: Agent[] = [
    { id: "RC1", name: "Recon Drone", type: "recon", pos: def.recon, path: [], task: "Awaiting launch", status: "IDLE", waypoint: 0, tasksDone: 0, distance: 0 },
    ...def.rescuers.map((p, i) => ({
      id: `RA${i + 1}`, name: `Rescue Agent ${i + 1}`, type: "rescue" as const, pos: p, path: [], task: "Standby at depot", status: "IDLE" as const, waypoint: 0, tasksDone: 0, distance: 0,
    })),
  ];
  const resources = Object.fromEntries(
    Object.entries(def.resources).map(([k, v]) => [k, { total: v, allocated: 0 }]),
  ) as Record<ResKey, Resource>;
  return {
    scenarioId: id,
    grid: parseGrid(def.map),
    agents,
    victims: def.victims.map((v, i) => ({ id: `V${String(i + 1).padStart(2, "0")}`, pos: v.pos, severity: v.severity, status: "undetected", kit: false, unreachable: false })),
    resources,
    tick: 0,
    status: "idle",
    speed: overrides?.speed ?? 1,
    severity: overrides?.severity ?? def.severity,
    seed: 1337 + id.length * 17,
    seq: 0,
    decisions: [],
    history: [{ tick: 0, time: clock(0), rescued: 0, detected: 0, resources: 100 }],
    lastSearch: null,
    stats: { searches: 0, nodesExplored: 0, reroutes: 0, rescueTimes: [] },
    soft: {
      medical: { task: "Monitoring triage feed", status: "STANDBY", actions: 0 },
      logistics: { task: "Inventory synced", status: "STANDBY", actions: 0 },
      path: { task: "Map loaded", status: "STANDBY", actions: 0 },
      coord: { task: "Awaiting start", status: "STANDBY", actions: 0 },
    },
    sweepDone: false,
  };
}

function rng(s: SimState) {
  s.seed = (s.seed * 1664525 + 1013904223) % 4294967296;
  return s.seed / 4294967296;
}

export function log(s: SimState, agent: AgentKind, msg: string, level: DecisionLevel = "info", toast = false) {
  s.seq++;
  s.decisions.unshift({ seq: s.seq, tick: s.tick, time: clock(s.tick), agent, msg, level, toast });
  if (s.decisions.length > 250) s.decisions.length = 250;
}

function soft(s: SimState, k: keyof SimState["soft"], task: string, status: string) {
  s.soft[k] = { task, status, actions: s.soft[k].actions + 1 };
}

function search(s: SimState, agent: Agent, to: Pos, purpose: string) {
  const res = astar(s.grid, agent.pos, to);
  s.stats.searches++;
  s.stats.nodesExplored += res.explored.length;
  s.lastSearch = { result: res, agentId: agent.id, from: agent.pos, to, purpose };
  return res;
}

export const remainingPct = (s: SimState) => {
  const vals = Object.values(s.resources).map((r) => Math.max(0, (r.total - r.allocated) / r.total));
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100);
};

function nearestHospital(s: SimState, agent: Agent) {
  let best: SearchResult | null = null;
  let bestPos: Pos | null = null;
  for (const h of [...findCells(s.grid, "hospital"), ...findCells(s.grid, "safe")]) {
    const r = astar(s.grid, agent.pos, h);
    if (r.found && (!best || r.cost < best.cost)) { best = r; bestPos = h; }
  }
  if (best && bestPos) {
    s.stats.searches++;
    s.stats.nodesExplored += best.explored.length;
    s.lastSearch = { result: best, agentId: agent.id, from: agent.pos, to: bestPos, purpose: "Transport to nearest hospital / safe zone" };
  }
  return best;
}

function detect(s: SimState, from: Pos, radius: number, by: AgentKind, byName: string) {
  const found = s.victims.filter((v) => v.status === "undetected" && manhattan(v.pos, from) <= radius);
  for (const v of found) {
    v.status = "detected";
    v.detectedAt = s.tick;
  }
  if (found.length) {
    log(s, by, `${byName} detected ${found.length} victim${found.length > 1 ? "s" : ""} near ${label(from)} (${found.map((v) => v.id).join(", ")})`, "info");
    const crit = found.filter((v) => v.severity === "critical");
    for (const v of crit) {
      log(s, "medical", `Classified ${v.id} as CRITICAL — assigned highest triage priority`, "critical", true);
      soft(s, "medical", `Triage ${v.id} (critical)`, "PRIORITIZING");
    }
  }
}

export function reroutePaths(s: SimState, blocked: Pos) {
  for (const a of s.agents) {
    if (a.type !== "rescue" || !a.path.some((p) => samePos(p, blocked))) continue;
    const goal = a.path[a.path.length - 1];
    const oldLen = a.path.length;
    const res = search(s, a, goal, `Re-plan after ${label(blocked)} blocked`);
    s.stats.reroutes++;
    soft(s, "path", `Re-routing ${a.id}`, "COMPUTING");
    if (res.found) {
      a.path = res.path.slice(1);
      log(s, "path", `Road ${label(blocked)} blocked on ${a.id}'s route — A* recalculated (${res.explored.length} nodes, ${a.path.length - oldLen >= 0 ? "+" : ""}${a.path.length - oldLen} steps)`, "warn", true);
    } else {
      a.path = [];
      releaseAgent(s, a, "No route available");
      log(s, "path", `${a.id} has no remaining route to ${label(goal)} — task returned to coordinator`, "critical", true);
    }
  }
}

function releaseAgent(s: SimState, a: Agent, why: string) {
  const v = s.victims.find((x) => x.id === a.target);
  if (v && v.status === "assigned") { v.status = "detected"; v.unreachable = true; }
  a.target = undefined;
  a.status = "IDLE";
  a.task = why;
  s.resources.vehicles.allocated = Math.max(0, s.resources.vehicles.allocated - 1);
}

function dynamicEvents(s: SimState) {
  const def = SCENARIOS[s.scenarioId];
  const scripted = def.scriptedBlocks?.filter((b) => b.tick === s.tick) ?? [];
  const events: Pos[] = scripted.map((b) => b.pos);
  if (!def.scriptedBlocks && s.tick > 3 && rng(s) < 0.025 * s.severity) {
    for (let tries = 0; tries < 20; tries++) {
      const p = { r: Math.floor(rng(s) * ROWS), c: Math.floor(rng(s) * COLS) };
      if (s.grid[p.r][p.c] !== "road") continue;
      if (s.agents.some((a) => samePos(a.pos, p)) || s.victims.some((v) => samePos(v.pos, p) && v.status !== "rescued")) continue;
      events.push(p);
      break;
    }
  }
  for (const p of events) {
    if (s.grid[p.r][p.c] === "blocked") continue;
    s.grid[p.r][p.c] = "blocked";
    log(s, "recon", `Hazard report: road ${label(p)} collapsed / impassable`, "warn");
    reroutePaths(s, p);
  }
}

function coordinate(s: SimState) {
  const idle = s.agents.filter((a) => a.type === "rescue" && a.status === "IDLE");
  for (const a of idle) {
    const candidates = s.victims.filter((v) => v.status === "detected" && !v.unreachable);
    if (!candidates.length) { a.task = "Standby — no open tasks"; continue; }
    let best: { v: Victim; res: SearchResult; score: number } | null = null;
    for (const v of candidates) {
      const res = astar(s.grid, a.pos, v.pos);
      if (!res.found) { v.unreachable = true; log(s, "path", `${v.id} at ${label(v.pos)} is unreachable — flagged for aerial support`, "critical"); continue; }
      const score = SEVERITY_WEIGHT[v.severity] + 2 * (s.tick - (v.detectedAt ?? s.tick)) - 2 * res.cost;
      if (!best || score > best.score) best = { v, res, score };
    }
    if (!best) continue;
    const { v } = best;
    const res = search(s, a, v.pos, `Route ${a.id} → ${v.id}`);
    v.status = "assigned";
    a.target = v.id;
    a.path = res.path.slice(1);
    a.status = "MOVING";
    a.task = `En route to ${v.id} (${v.severity})`;
    s.resources.vehicles.allocated = Math.min(s.resources.vehicles.total, s.resources.vehicles.allocated + 1);
    log(s, "coord", `Assigned ${a.id} → ${v.id} (${v.severity}, utility ${Math.round(best.score)})`, "info");
    soft(s, "coord", `Dispatching ${a.id} → ${v.id}`, "COORDINATING");
    log(s, "path", `A* route for ${a.id}: ${label(res.path[0])} → ${label(v.pos)} · cost ${res.cost} · ${res.explored.length} nodes explored`, "info");
    soft(s, "path", `Route ${a.id} → ${v.id}`, "COMPUTING");

    if (v.severity !== "minor") {
      const kits = s.resources.medicalKits;
      if (kits.allocated < kits.total) {
        kits.allocated++;
        v.kit = true;
        s.resources.equipment.allocated = Math.min(s.resources.equipment.total, s.resources.equipment.allocated + 1);
        log(s, "logistics", `Allocated medical kit to ${a.id} for ${v.id} (${kits.total - kits.allocated} left)`, "success", v.severity === "critical");
        soft(s, "logistics", `Kit → ${a.id}`, "ALLOCATING");
      } else {
        log(s, "logistics", `Medical kit shortage — ${v.id} served with basic first aid only`, "critical", true);
        soft(s, "logistics", "Shortage: requesting resupply", "SHORTAGE");
      }
    }
  }
}

function moveAgents(s: SimState) {
  for (const a of s.agents) {
    if (a.type === "recon") {
      if (s.sweepDone && s.victims.every((v) => v.status !== "undetected")) { a.status = "IDLE"; a.task = "Sweep complete"; continue; }
      const wp = SWEEP[a.waypoint % SWEEP.length];
      if (samePos(a.pos, wp)) {
        a.waypoint++;
        if (a.waypoint >= SWEEP.length) s.sweepDone = true;
      } else {
        const dr = Math.sign(wp.r - a.pos.r), dc = Math.sign(wp.c - a.pos.c);
        a.pos = dc !== 0 ? { r: a.pos.r, c: a.pos.c + dc } : { r: a.pos.r + dr, c: a.pos.c };
        a.distance++;
      }
      a.status = "SCANNING";
      a.task = `Scanning sector ${label(a.pos)}`;
      detect(s, a.pos, 2, "recon", "Recon drone");
      continue;
    }
    if (a.status === "RESCUING") {
      const v = s.victims.find((x) => x.id === a.target)!;
      const res = nearestHospital(s, a);
      if (!res) { log(s, "path", `${a.id} cannot reach any hospital — holding position`, "critical"); continue; }
      a.carrying = v.id;
      a.path = res.path.slice(1);
      a.status = "TRANSPORTING";
      a.task = `Transporting ${v.id} to ${label(res.path[res.path.length - 1])}`;
      log(s, "rescue", `${a.id} stabilised ${v.id}; transporting to ${label(res.path[res.path.length - 1])} (cost ${res.cost})`, "info");
      continue;
    }
    if (!a.path.length) continue;
    const next = a.path[0];
    if (s.grid[next.r][next.c] === "blocked") { reroutePaths(s, next); continue; }
    a.path.shift();
    a.pos = next;
    a.distance++;
    s.resources.fuel.allocated = Math.min(s.resources.fuel.total, s.resources.fuel.allocated + 1);
    detect(s, a.pos, 1, "rescue", a.id);
    if (!a.path.length) {
      if (a.status === "MOVING") {
        a.status = "RESCUING";
        a.task = `Rescuing ${a.target}`;
        log(s, "rescue", `${a.id} reached ${a.target} at ${label(a.pos)} — extraction in progress`, "info");
      } else if (a.status === "TRANSPORTING") {
        const v = s.victims.find((x) => x.id === a.carrying)!;
        v.status = "rescued";
        v.rescuedAt = s.tick;
        s.stats.rescueTimes.push(((s.tick - (v.detectedAt ?? 0)) * TICK_SECONDS) / 60);
        s.resources.water.allocated = Math.min(s.resources.water.total, s.resources.water.allocated + 4);
        s.resources.food.allocated = Math.min(s.resources.food.total, s.resources.food.allocated + 3);
        s.resources.vehicles.allocated = Math.max(0, s.resources.vehicles.allocated - 1);
        a.tasksDone++;
        a.carrying = undefined;
        a.target = undefined;
        a.status = "IDLE";
        a.task = "Available";
        log(s, "rescue", `${v.id} delivered safely to ${label(a.pos)} — rescue complete`, "success", true);
      }
    }
  }
}

export function step(prev: SimState): SimState {
  const s: SimState = structuredClone(prev);
  if (s.status === "completed") return s;
  if (s.tick === 0) {
    log(s, "coord", `Simulation started: ${SCENARIOS[s.scenarioId].name} (severity ${s.severity})`, "info");
    soft(s, "coord", "Monitoring global state", "ACTIVE");
  }
  s.tick++;
  dynamicEvents(s);
  moveAgents(s);
  coordinate(s);
  for (const k of ["medical", "logistics", "path"] as const) {
    if (s.tick % 4 === 0 && s.soft[k].status !== "SHORTAGE") s.soft[k] = { ...s.soft[k], status: "MONITORING" };
  }
  const rescued = s.victims.filter((v) => v.status === "rescued").length;
  s.history.push({ tick: s.tick, time: clock(s.tick), rescued, detected: s.victims.filter((v) => v.status !== "undetected").length, resources: remainingPct(s) });
  if (s.history.length > 300) s.history.shift();

  const open = s.victims.filter((v) => v.status !== "rescued");
  const allIdle = s.agents.every((a) => a.type === "recon" || a.status === "IDLE");
  if (!open.length || (s.sweepDone && allIdle && open.every((v) => v.unreachable || v.status === "undetected")) || s.tick > 400) {
    s.status = "completed";
    log(s, "coord", `Operation complete: ${rescued}/${s.victims.length} victims rescued in ${Math.round((s.tick * TICK_SECONDS) / 60)} min`, "success", true);
    soft(s, "coord", "Operation complete", "DONE");
  }
  return s;
}

/** Run a scenario headlessly and keep every frame for replay. */
export function runToCompletion(id: ScenarioId, maxTicks = 300) {
  let s = createSim(id);
  s.status = "running";
  const frames: SimState[] = [s];
  while (s.status !== "completed" && s.tick < maxTicks) {
    s = step(s);
    frames.push(s);
  }
  return frames;
}

export function metrics(s: SimState) {
  const rescued = s.victims.filter((v) => v.status === "rescued").length;
  const times = s.stats.rescueTimes;
  return {
    rescued,
    total: s.victims.length,
    detected: s.victims.filter((v) => v.status !== "undetected").length,
    critical: s.victims.filter((v) => v.severity === "critical" && v.status !== "rescued").length,
    avgRescue: times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0,
    duration: (s.tick * TICK_SECONDS) / 60,
    resources: remainingPct(s),
    distance: s.agents.filter((a) => a.type === "rescue").reduce((a, b) => a + b.distance, 0),
  };
}

export const posKey = key;
