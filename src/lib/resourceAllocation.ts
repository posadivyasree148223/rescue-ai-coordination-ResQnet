export type Severity = "critical" | "serious" | "minor";

export const SEVERITY_WEIGHT: Record<Severity, number> = { critical: 100, serious: 60, minor: 30 };

export interface AllocationRequest {
  id: string;
  severity: Severity;
  waitMin: number;
  distance: number;
}

export interface AllocationDecision extends AllocationRequest {
  score: number;
  allocated: boolean;
  rank: number;
  reason: string;
}

/**
 * Utility-based priority: U = severity weight + 2·wait − 1.5·distance.
 * Requests are served greedily in decreasing utility until supply is exhausted.
 */
export function priorityScore(r: AllocationRequest) {
  return Math.round(SEVERITY_WEIGHT[r.severity] + 2 * r.waitMin - 1.5 * r.distance);
}

export function allocateByPriority(requests: AllocationRequest[], available: number): AllocationDecision[] {
  const scored = requests
    .map((r) => ({ ...r, score: priorityScore(r) }))
    .sort((a, b) => b.score - a.score);
  let left = available;
  return scored.map((r, i) => {
    const allocated = left > 0;
    if (allocated) left--;
    return {
      ...r,
      rank: i + 1,
      allocated,
      reason: allocated
        ? `Rank ${i + 1}: utility ${r.score} within supply of ${available}`
        : `Supply exhausted — utility ${r.score} below cut-off; queued for resupply`,
    };
  });
}
