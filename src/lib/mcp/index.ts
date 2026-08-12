import { defineMcp, auth, type ToolDefinition } from "@lovable.dev/mcp-js";

import getGalleryItem from "./tools/get-gallery-item";
import listGalleryItems from "./tools/list-gallery-items";
import updateGalleryItem from "./tools/update-gallery-item";

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// value that survives publish unchanged.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "saha-s-gallery",
  title: "Saha Creative Space",
  version: "0.1.0",
  instructions:
    "Tools for Saha's Gallery, a photo and video gallery. Use `list_gallery_items` to browse or search the collection, `get_gallery_item` for one item's details and download path, and `update_gallery_item` to edit an item's title, caption, location or ordering (curator only).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listGalleryItems, getGalleryItem, updateGalleryItem] as ToolDefinition[],
});
