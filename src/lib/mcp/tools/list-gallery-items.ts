import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { supabaseForUser } from "../supabase";

const COLUMNS =
  "id,title,caption,location,taken_year,media_type,file_path,mime_type,width,height,sort_order,created_at";

export default defineTool({
  name: "list_gallery_items",
  title: "List gallery items",
  description:
    "List photos and videos in Saha's Gallery, optionally filtered by media type or a text search over title, caption and location.",
  inputSchema: {
    media_type: z
      .enum(["photo", "video"])
      .optional()
      .describe("Only return items of this media type."),
    search: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe("Free-text filter over title, caption and location."),
    limit: z.number().int().min(1).max(100).default(25).describe("Max items to return."),
  },
  outputSchema: { count: z.number(), items: z.array(z.record(z.string(), z.unknown())) },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ media_type, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("media_items")
      .select(COLUMNS)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(limit ?? 25);
    if (media_type) query = query.eq("media_type", media_type);
    if (search) {
      const term = `%${search}%`;
      query = query.or(
        `title.ilike.${term},caption.ilike.${term},location.ilike.${term}`,
      );
    }
    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    const items = data ?? [];
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { count: items.length, items },
    };
  },
});
