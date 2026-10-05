import { createFileRoute, Link } from "@tanstack/react-router";
import { Network, Route as RouteIcon, Boxes, ArrowRight } from "lucide-react";
import { Panel, SimBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "ResQNet" },
      { name: "description", content: "ResQNet: an academic multi-agent AI simulation for coordinated disaster rescue and dynamic resource allocation." },
      { property: "og:title", content: "About ResQNet" },
      { property: "og:description", content: "Intelligent coordination when every second matters." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="rounded-2xl bg-navy px-8 py-14 text-navy-foreground md:px-14">
        <SimBadge />
        <p className="mt-6 font-mono text-sm font-bold tracking-[0.3em] text-ai">RESQNET</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">Intelligent coordination when every second matters.</h1>
        <p className="mt-4 max-w-2xl text-navy-muted">ResQNet is a multi-agent AI simulation that demonstrates how autonomous agents can cooperate to coordinate disaster rescue operations, perform path planning, and dynamically allocate limited resources in a changing environment.</p>
        <Button asChild className="mt-6"><Link to="/simulation">Launch simulation <ArrowRight /></Link></Button>
      </section>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {[[Network, "Multi-Agent Coordination", "Multiple autonomous agents cooperate to achieve shared rescue goals."], [RouteIcon, "Intelligent Search", "A* search enables efficient route planning in changing environments."], [Boxes, "Dynamic Resource Allocation", "Limited resources are continuously allocated according to rescue priorities."]].map(([I, t, d]) => {
          const Icon = I as typeof Network;
          return <div key={t as string} className="rounded-xl border bg-card p-5 shadow-card"><Icon className="size-5 text-ai" /><h3 className="mt-3 font-mono text-xs font-semibold uppercase tracking-wider">{t as string}</h3><p className="mt-2 text-sm text-muted-foreground">{d as string}</p></div>;
        })}
      </div>
      <Panel title="Problem Statement" className="mt-5">
        <p className="text-sm leading-relaxed text-muted-foreground">After a disaster, responders face a partially observable, dynamic environment: victims are scattered, roads fail unpredictably and supplies are scarce. The problem is to design cooperating agents that detect victims, prioritise them by severity, plan safe low-cost routes (A*), and allocate limited resources so that the number of victims rescued is maximised and rescue time minimised.</p>
      </Panel>
    </>
  );
}
