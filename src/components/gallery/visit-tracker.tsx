import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";

import { recordVisit } from "@/lib/visits.functions";

const KEY = "saha-gallery-visitor";

/** Logs one visit per browser session so the curator can see traffic over time. */
export function VisitTracker() {
  const log = useServerFn(recordVisit);

  useEffect(() => {
    let visitorId: string;
    try {
      visitorId = localStorage.getItem(KEY) ?? "";
      if (!visitorId) {
        visitorId =
          "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
        localStorage.setItem(KEY, visitorId);
      }
      if (sessionStorage.getItem(KEY) === "logged") return;
      sessionStorage.setItem(KEY, "logged");
    } catch {
      visitorId = Math.random().toString(36).slice(2);
    }

    void log({ data: { visitorId, path: window.location.pathname } }).catch(() => undefined);
  }, [log]);

  return null;
}
