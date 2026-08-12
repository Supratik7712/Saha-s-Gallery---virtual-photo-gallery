import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

/**
 * Live count of people currently viewing the gallery.
 * Uses realtime presence — no database table involved.
 */
export function useLiveViewers() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const viewerId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    const channel = supabase.channel("gallery-live", {
      config: { presence: { key: viewerId } },
    });

    const sync = () => {
      const state = channel.presenceState();
      setCount(Object.keys(state).length);
    };

    channel
      .on("presence", { event: "sync" }, sync)
      .on("presence", { event: "join" }, sync)
      .on("presence", { event: "leave" }, sync)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void channel.track({ at: new Date().toISOString() });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return count;
}

export function LiveViewers({ className = "" }: { className?: string }) {
  const count = useLiveViewers();

  if (count === null) return null;

  return (
    <p
      className={`flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground sm:text-[10px] sm:tracking-[0.3em] ${className}`}
      aria-live="polite"
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      <span className="text-accent">{count}</span>
      {count === 1 ? "person viewing now" : "people viewing now"}
    </p>
  );
}
