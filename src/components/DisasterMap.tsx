import { Hospital, Warehouse, ShieldCheck, User } from "lucide-react";
import { type Grid, type Pos, key, label } from "@/lib/grid";
import type { Agent, Victim } from "@/lib/simulation";
import { AgentIcon } from "./AgentIcon";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface MapPath { points: Pos[]; tone: "ai" | "safe" | "danger" | "warning" | "muted"; dashed?: boolean }

interface Props {
  grid: Grid;
  agents?: Agent[];
  victims?: Victim[];
  paths?: MapPath[];
  explored?: Set<string>;
  frontier?: Set<string>;
  current?: Pos | null;
  start?: Pos | null;
  goal?: Pos | null;
  onCellClick?: (p: Pos) => void;
  showCoords?: boolean;
  className?: string;
}

const STROKE = { ai: "var(--ai)", safe: "var(--safe)", danger: "var(--danger)", warning: "var(--warning)", muted: "var(--muted-foreground)" };
const SEV = { critical: "bg-danger text-destructive-foreground pulse-ring", serious: "bg-warning text-primary-foreground", minor: "bg-ai/80 text-primary-foreground" };

export function DisasterMap({ grid, agents = [], victims = [], paths = [], explored, frontier, current, start, goal, onCellClick, showCoords = true, className }: Props) {
  const R = grid.length, C = grid[0].length;
  const pct = (p: Pos) => ({ left: `${((p.c + 0.5) / C) * 100}%`, top: `${((p.r + 0.5) / R) * 100}%` });

  return (
    <div className={cn("relative select-none", className)}>
      {showCoords && (
        <div className="mb-1 grid pl-5" style={{ gridTemplateColumns: `repeat(${C}, 1fr)` }}>
          {Array.from({ length: C }, (_, i) => <span key={i} className="text-center font-mono text-[9px] text-muted-foreground">{i + 1}</span>)}
        </div>
      )}
      <div className="flex">
        {showCoords && (
          <div className="grid w-5" style={{ gridTemplateRows: `repeat(${R}, 1fr)` }}>
            {Array.from({ length: R }, (_, i) => <span key={i} className="flex items-center font-mono text-[9px] text-muted-foreground">{String.fromCharCode(65 + i)}</span>)}
          </div>
        )}
        <div className="relative flex-1 overflow-hidden rounded-lg border bg-muted/40" style={{ aspectRatio: `${C} / ${R}` }}>
          <div className="absolute inset-0 grid gap-px p-px" style={{ gridTemplateColumns: `repeat(${C}, 1fr)`, gridTemplateRows: `repeat(${R}, 1fr)` }}>
            {grid.map((row, r) =>
              row.map((k, c) => {
                const p = { r, c };
                const kk = key(p);
                const isExp = explored?.has(kk);
                const isFr = frontier?.has(kk);
                return (
                  <button
                    type="button"
                    key={kk}
                    title={`${label(p)} · ${k}`}
                    onClick={() => onCellClick?.(p)}
                    className={cn(
                      "relative grid place-items-center rounded-[3px] transition-colors duration-300",
                      k === "road" && "bg-card",
                      k === "blocked" && "hatch",
                      k === "hazard" && "bg-danger/15",
                      k === "hospital" && "bg-safe/15",
                      k === "safe" && "bg-safe/10",
                      k === "depot" && "bg-ai/10",
                      isFr && k !== "blocked" && "bg-warning/20",
                      isExp && k !== "blocked" && "bg-ai/20",
                      onCellClick ? "cursor-crosshair hover:ring-2 hover:ring-ai/50 hover:z-10" : "cursor-default",
                    )}
                  >
                    {k === "hospital" && <Hospital className="size-[45%] text-safe" />}
                    {k === "depot" && <Warehouse className="size-[42%] text-ai" />}
                    {k === "safe" && <ShieldCheck className="size-[42%] text-safe" />}
                  </button>
                );
              }),
            )}
          </div>

          <svg className="pointer-events-none absolute inset-0 size-full" viewBox={`0 0 ${C} ${R}`} preserveAspectRatio="none">
            {paths.map((p, i) =>
              p.points.length > 1 ? (
                <polyline
                  key={i}
                  points={p.points.map((q) => `${q.c + 0.5},${q.r + 0.5}`).join(" ")}
                  fill="none"
                  stroke={STROKE[p.tone]}
                  strokeWidth={p.dashed ? 0.08 : 0.13}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={p.dashed ? 0.6 : 0.9}
                  className={p.dashed ? "" : "route-dash"}
                />
              ) : null,
            )}
          </svg>

          {start && <Marker p={start} pct={pct} cls="bg-ai text-primary-foreground">S</Marker>}
          {goal && <Marker p={goal} pct={pct} cls="bg-safe text-primary-foreground">G</Marker>}
          {current && <div className="pointer-events-none absolute size-[7%] -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-ai transition-all duration-150" style={pct(current)} />}

          {victims.filter((v) => v.status !== "rescued" && !agents.some((a) => a.carrying === v.id)).map((v) => (
            <Tooltip key={v.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn("absolute grid size-[5.5%] min-w-4 min-h-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-all duration-500", SEV[v.severity], v.status === "undetected" && "opacity-35 grayscale")}
                  style={pct(v.pos)}
                >
                  <User className="size-[60%]" />
                </div>
              </TooltipTrigger>
              <TooltipContent>{v.id} · {v.severity} · {v.status}{v.unreachable ? " · unreachable" : ""}</TooltipContent>
            </Tooltip>
          ))}

          {agents.map((a) => (
            <Tooltip key={a.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-md border bg-card px-1 py-0.5 shadow-md transition-all duration-700 ease-in-out",
                    a.type === "recon" ? "border-ai/50 text-ai" : "border-danger/40 text-danger",
                  )}
                  style={pct(a.pos)}
                >
                  <AgentIcon kind={a.type} className="size-3" />
                  <span className="font-mono text-[9px] font-semibold text-foreground">{a.id}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>{a.name} · {a.status} · {a.task}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}

function Marker({ p, pct, cls, children }: { p: Pos; pct: (p: Pos) => { left: string; top: string }; cls: string; children: string }) {
  return <div className={cn("absolute z-10 grid size-[5.5%] min-w-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-md font-mono text-[10px] font-bold shadow", cls)} style={pct(p)}>{children}</div>;
}

export function MapLegend() {
  const items = [
    ["bg-card border", "Road"], ["hatch", "Blocked"], ["bg-danger/20", "Disaster zone"], ["bg-safe/20", "Hospital / safe"], ["bg-ai/15", "Resource depot"],
    ["bg-danger rounded-full", "Critical victim"], ["bg-warning rounded-full", "Serious"], ["bg-ai/80 rounded-full", "Minor"],
  ];
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
      {items.map(([c, l]) => <span key={l} className="flex items-center gap-1.5"><span className={cn("size-3 rounded-[3px]", c)} />{l}</span>)}
    </div>
  );
}
