import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_gallery_item",
  title: "Update gallery item",
  description:
    "Update the title, caption, location, year or sort order of a gallery item. Only the gallery curator is allowed to make changes.",
  inputSchema: {
    id: z.string().uuid().describe("The gallery item id."),
    title: z.string().trim().min(1).max(200).optional(),
    caption: z.string().max(2000).optional(),
    location: z.string().max(200).optional(),
    taken_year: z.number().int().min(1800).max(2100).nullable().optional(),
    sort_order: z.number().int().optional(),
  },
  outputSchema: { item: z.record(z.string(), z.unknown()) },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ id, ...fields }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(patch).length === 0) {
      return {
        content: [{ type: "text", text: "Provide at least one field to update." }],
        isError: true,
      };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("media_items")
      .update(patch)
      .eq("id", id)
      .select("id,title,caption,location,taken_year,sort_order");
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    if (!data || data.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No item was updated — either the id does not exist or this account is not the gallery curator.",
          },
        ],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data[0], null, 2) }],
      structuredContent: { item: data[0] },
    };
  },
});
