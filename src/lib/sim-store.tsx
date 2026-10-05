import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { toast } from "sonner";
import { createSim, step, log, reroutePaths, type SimState } from "./simulation";
import { type Pos, label, samePos } from "./grid";
import type { ScenarioId, ResKey } from "./scenarios";
import type { Severity } from "./resourceAllocation";

interface Ctx {
  sim: SimState;
  start: () => void;
  pause: () => void;
  reset: (id?: ScenarioId) => void;
  stepOnce: () => void;
  setSpeed: (n: number) => void;
  setSeverity: (n: 1 | 2 | 3) => void;
  toggleObstacle: (p: Pos) => void;
  addVictim: (p: Pos, sev: Severity) => void;
  setResourceTotal: (k: ResKey, total: number) => void;
  allocate: (k: ResKey, n: number, note: string) => void;
  recalculate: () => void;
}

const SimCtx = createContext<Ctx | null>(null);

export function SimProvider({ children }: { children: ReactNode }) {
  const [sim, setSim] = useState<SimState>(() => createSim("earthquake"));
  const toasted = useRef(0);

  useEffect(() => {
    if (sim.status !== "running") return;
    const id = setInterval(() => setSim((s) => (s.status === "running" ? step(s) : s)), 800 / sim.speed);
    return () => clearInterval(id);
  }, [sim.status, sim.speed]);

  useEffect(() => {
    const fresh = sim.decisions.filter((d) => d.seq > toasted.current && d.toast).slice(0, 2);
    if (sim.decisions[0]) toasted.current = Math.max(toasted.current, sim.decisions[0].seq);
    for (const d of fresh.reverse()) {
      const fn = d.level === "critical" ? toast.error : d.level === "warn" ? toast.warning : d.level === "success" ? toast.success : toast.info;
      fn(d.msg, { description: `${d.time} · simulated` });
    }
  }, [sim.decisions]);

  const mutate = useCallback((fn: (s: SimState) => void) => {
    setSim((prev) => {
      const s = structuredClone(prev);
      fn(s);
      return s;
    });
  }, []);

  const value: Ctx = {
    sim,
    start: () => mutate((s) => { if (s.status !== "completed") s.status = "running"; }),
    pause: () => mutate((s) => { if (s.status === "running") s.status = "paused"; }),
    reset: (id) => { toasted.current = Infinity; setSim((s) => createSim(id ?? s.scenarioId, { speed: s.speed })); setTimeout(() => (toasted.current = 0), 50); },
    stepOnce: () => setSim((s) => (s.status === "completed" ? s : { ...step(s), status: s.status === "idle" ? "paused" : s.status })),
    setSpeed: (n) => mutate((s) => { s.speed = n; }),
    setSeverity: (n) => mutate((s) => { s.severity = n; }),
    toggleObstacle: (p) =>
      mutate((s) => {
        const k = s.grid[p.r][p.c];
        if (k === "blocked") {
          s.grid[p.r][p.c] = "road";
          s.victims.forEach((v) => (v.unreachable = false));
          log(s, "path", `Road ${label(p)} cleared — map updated, unreachable flags reset`, "success");
        } else if (k === "road" || k === "hazard") {
          if (s.agents.some((a) => samePos(a.pos, p)) || s.victims.some((v) => samePos(v.pos, p))) return;
          s.grid[p.r][p.c] = "blocked";
          log(s, "path", `Operator blocked road ${label(p)}. A* recalculating affected routes...`, "warn", true);
          reroutePaths(s, p);
        }
      }),
    addVictim: (p, sev) =>
      mutate((s) => {
        const k = s.grid[p.r][p.c];
        if (k === "blocked" || s.victims.some((v) => samePos(v.pos, p) && v.status !== "rescued")) return;
        const id = `V${String(s.victims.length + 1).padStart(2, "0")}`;
        s.victims.push({ id, pos: p, severity: sev, status: "detected", detectedAt: s.tick, kit: false, unreachable: false });
        if (s.status === "completed") s.status = "paused";
        log(s, "recon", `Distress signal: ${id} (${sev}) reported at ${label(p)}`, sev === "critical" ? "critical" : "info", true);
      }),
    setResourceTotal: (k, total) => mutate((s) => { s.resources[k].total = Math.max(total, 1); s.resources[k].allocated = Math.min(s.resources[k].allocated, s.resources[k].total); }),
    allocate: (k, n, note) =>
      mutate((s) => {
        const r = s.resources[k];
        const give = Math.min(n, r.total - r.allocated);
        if (give <= 0) { log(s, "logistics", `Allocation refused: no ${k} remaining`, "critical", true); return; }
        r.allocated += give;
        log(s, "logistics", `${note} (${give} ${k} allocated, ${r.total - r.allocated} left)`, "success", true);
        s.soft.logistics = { task: note, status: "ALLOCATING", actions: s.soft.logistics.actions + 1 };
      }),
    recalculate: () =>
      mutate((s) => {
        let n = 0;
        for (const a of s.agents) {
          if (a.type !== "rescue" || !a.path.length) continue;
          const goal = a.path[a.path.length - 1];
          a.path = [...a.path.slice(0, -1), goal];
          reroutePaths(s, a.path[0]);
          n++;
        }
        if (!n) log(s, "path", "Recalculate requested — no active routes to re-plan", "info", true);
      }),
  };

  return <SimCtx.Provider value={value}>{children}</SimCtx.Provider>;
}

export function useSim() {
  const c = useContext(SimCtx);
  if (!c) throw new Error("useSim outside SimProvider");
  return c;
}
