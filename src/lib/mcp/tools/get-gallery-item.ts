import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { supabaseForUser } from "../supabase";

const COLUMNS =
  "id,title,caption,location,taken_year,media_type,file_path,mime_type,width,height,sort_order,created_at";

export default defineTool({
  name: "get_gallery_item",
  title: "Get gallery item",
  description:
    "Fetch one gallery item by id, including its public stream URL and download URL paths.",
  inputSchema: { id: z.string().uuid().describe("The gallery item id.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("media_items")
      .select(COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    if (!data) {
      return { content: [{ type: "text", text: `No gallery item with id ${id}` }], isError: true };
    }
    const path = String((data as { file_path: string }).file_path)
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    const item = {
      ...data,
      stream_path: `/api/media/${path}`,
      download_path: `/api/media/${path}?download=1`,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(item, null, 2) }],
      structuredContent: { item },
    };
  },
});
