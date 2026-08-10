import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { assertAdmin } from "./media-admin.server";

const MEDIA_COLUMNS =
  "id,title,caption,location,taken_year,media_type,file_path,mime_type,width,height,sort_order,created_at";

/** Public read: every published gallery item, newest first. */
export const listMedia = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
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
  const { data, error } = await supabase
    .from("media_items")
    .select(MEDIA_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

/** Tells the signed-in user whether they hold the admin role. */
export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    const email =
      typeof context.claims["email"] === "string" ? context.claims["email"] : null;
    return { isAdmin: data === true, email };
  });

export const createMediaItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        title: z.string().min(1).max(200),
        caption: z.string().max(2000).optional(),
        location: z.string().max(200).optional(),
        taken_year: z.number().int().min(1800).max(2100).optional(),
        media_type: z.enum(["photo", "video"]),
        file_path: z.string().min(1).max(500),
        mime_type: z.string().max(100).optional(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
        sort_order: z.number().int().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("media_items")
      .insert({
        title: data.title,
        caption: data.caption ?? null,
        location: data.location ?? null,
        taken_year: data.taken_year ?? null,
        media_type: data.media_type,
        file_path: data.file_path,
        mime_type: data.mime_type ?? null,
        width: data.width ?? null,
        height: data.height ?? null,
        sort_order: data.sort_order ?? 0,
      })
      .select(MEDIA_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateMediaItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().min(1).max(200),
        caption: z.string().max(2000).optional(),
        location: z.string().max(200).optional(),
        taken_year: z.number().int().min(1800).max(2100).nullable().optional(),
        sort_order: z.number().int().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("media_items")
      .update({
        title: data.title,
        caption: data.caption ?? null,
        location: data.location ?? null,
        taken_year: data.taken_year ?? null,
        sort_order: data.sort_order ?? 0,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteMediaItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error: readError } = await context.supabase
      .from("media_items")
      .select("file_path")
      .eq("id", data.id)
      .single();
    if (readError) throw new Error(readError.message);
    const { error } = await context.supabase.from("media_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (row?.file_path) {
      await context.supabase.storage.from("gallery").remove([row.file_path]);
    }
    return { ok: true as const };
  });
