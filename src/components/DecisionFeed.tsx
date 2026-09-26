import type { Decision } from "@/lib/simulation";
import { AGENT_META } from "@/lib/simulation";
import { AgentIcon, AGENT_TONE } from "./AgentIcon";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

const LEVEL = { info: "border-l-ai", warn: "border-l-warning", critical: "border-l-danger", success: "border-l-safe" };

export function DecisionFeed({ decisions, limit = 12, compact }: { decisions: Decision[]; limit?: number; compact?: boolean }) {
  if (!decisions.length)
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
        <Inbox className="size-6 opacity-50" />
        No decisions yet. Start the simulation to watch agents reason.
      </div>
    );
  return (
    <ol className="space-y-1.5">
      {decisions.slice(0, limit).map((d) => (
        <li key={d.seq} className={cn("flex items-start gap-3 rounded-md border-l-2 bg-muted/40 px-3 py-2 animate-fade-in", LEVEL[d.level])}>
          <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-md", AGENT_TONE[d.agent])}><AgentIcon kind={d.agent} className="size-3.5" /></span>
          <div className="min-w-0 flex-1">
            <p className={cn("leading-snug", compact ? "text-xs" : "text-[13px]")}>
              <span className="font-semibold">{AGENT_META[d.agent].name}</span> <span className="text-muted-foreground">→</span> {d.msg}
            </p>
          </div>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{d.time}</span>
        </li>
      ))}
    </ol>
  );
}
