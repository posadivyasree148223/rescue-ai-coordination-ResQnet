import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ScrollText } from "lucide-react";
import { useSim } from "@/lib/sim-store";
import { AGENT_META, type AgentKind } from "@/lib/simulation";
import { PageHeader, Panel, SimBadge } from "@/components/ui-kit";
import { DecisionFeed } from "@/components/DecisionFeed";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/log")({
  head: () => ({
    meta: [
      { title: "AI Decision Log — ResQNet" },
      { name: "description", content: "Chronological timeline of every decision made by ResQNet's AI agents." },
      { property: "og:title", content: "AI Decision Log — ResQNet" },
      { property: "og:description", content: "Every perception, plan and allocation logged in real time." },
    ],
  }),
  component: LogPage,
});

function LogPage() {
  const { sim } = useSim();
  const [f, setF] = useState<AgentKind | "all">("all");
  const list = f === "all" ? sim.decisions : sim.decisions.filter((d) => d.agent === f);
  return (
    <>
      <PageHeader eyebrow="Explainability" title="AI Decision Log" subtitle="Live chronological timeline; newest first." actions={<SimBadge />} />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["all", ...Object.keys(AGENT_META)] as (AgentKind | "all")[]).map((k) => (
          <button key={k} onClick={() => setF(k)} className={cn("rounded-full border px-3 py-1 text-xs", f === k ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted")}>{k === "all" ? "All agents" : AGENT_META[k].name}</button>
        ))}
      </div>
      <Panel title={`${list.length} decisions`} icon={ScrollText}><DecisionFeed decisions={list} limit={250} /></Panel>
    </>
  );
}
