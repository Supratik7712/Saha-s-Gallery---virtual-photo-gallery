import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getVisitStats } from "@/lib/visits.functions";
import { useLiveViewers } from "@/components/gallery/live-viewers";

/** Curator-only traffic panel: live viewers plus logged visit history. */
export function VisitorStats() {
  const fetchStats = useServerFn(getVisitStats);
  const live = useLiveViewers();
  const { data } = useQuery({
    queryKey: ["visit-stats"],
    queryFn: () => fetchStats(),
    refetchInterval: 60_000,
  });

  const cards = [
    { label: "Viewing now", value: live ?? 0 },
    { label: "Visits today", value: data?.last24h ?? 0 },
    { label: "Unique visitors 24h", value: data?.uniqueVisitors24h ?? 0 },
    { label: "Visits last 7 days", value: data?.last7d ?? 0 },
    { label: "Total visits", value: data?.total ?? 0 },
  ];

  return (
    <section className="mb-10 border border-border/50 p-6 md:p-10">
      <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Audience</h2>
      <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label}>
            <p className="font-display text-3xl italic text-foreground">{card.value}</p>
            <p className="mt-1 font-mono text-[9px] uppercase leading-relaxed tracking-[0.2em] text-muted-foreground">
              {card.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
