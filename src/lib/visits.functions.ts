import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "./media-admin.server";

/** Logs one gallery visit. Public — anonymous visitors are allowed to insert. */
export const recordVisit = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        visitorId: z.string().min(1).max(64),
        path: z.string().max(300).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const supabase = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });

    await supabase
      .from("gallery_visits")
      .insert({ visitor_id: data.visitorId, path: data.path ?? "/" });
    return { ok: true };
  });

/** Curator-only visitor analytics. */
export const getVisitStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);

    const since = (hours: number) =>
      new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const countSince = async (iso?: string) => {
      let query = context.supabase
        .from("gallery_visits")
        .select("*", { count: "exact", head: true });
      if (iso) query = query.gte("created_at", iso);
      const { count } = await query;
      return count ?? 0;
    };

    const { data: recent } = await context.supabase
      .from("gallery_visits")
      .select("visitor_id,created_at")
      .gte("created_at", since(24))
      .order("created_at", { ascending: false })
      .limit(1000);

    const uniqueToday = new Set((recent ?? []).map((row) => row.visitor_id)).size;

    return {
      total: await countSince(),
      last24h: await countSince(since(24)),
      last7d: await countSince(since(24 * 7)),
      uniqueVisitors24h: uniqueToday,
    };
  });
