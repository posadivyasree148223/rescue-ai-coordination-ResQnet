import { Ambulance, Radar, HeartPulse, Package, Route, Network, type LucideIcon } from "lucide-react";
import type { AgentKind } from "@/lib/simulation";

export const AGENT_ICONS: Record<AgentKind, LucideIcon> = {
  recon: Radar,
  rescue: Ambulance,
  medical: HeartPulse,
  logistics: Package,
  path: Route,
  coord: Network,
};

export const AGENT_TONE: Record<AgentKind, string> = {
  recon: "text-ai bg-ai/10",
  rescue: "text-danger bg-danger/10",
  medical: "text-safe bg-safe/10",
  logistics: "text-warning bg-warning/10",
  path: "text-ai bg-ai/10",
  coord: "text-primary bg-primary/10",
};

export function AgentIcon({ kind, className = "size-4" }: { kind: AgentKind; className?: string }) {
  const I = AGENT_ICONS[kind];
  return <I className={className} />;
}
