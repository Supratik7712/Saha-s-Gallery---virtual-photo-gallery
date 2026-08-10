import { createFileRoute } from "@tanstack/react-router";

/**
 * Public media stream for the private "gallery" storage bucket.
 * Gallery content is intentionally public; this route streams it with
 * long-lived cache headers, optional forced download (?download=1),
 * and HTTP Range support so videos can be seeked.
 */
export const Route = createFileRoute("/api/media/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const splat = params._splat ?? "";
        const path = splat.replace(/^\/+/, "");
        if (!path || path.includes("..")) {
          return new Response("Bad request", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("gallery").download(path);
        if (error || !data) {
          return new Response("Not found", { status: 404 });
        }

        const url = new URL(request.url);
        const filename = path.split("/").pop() || "saha-gallery";
        const disposition = url.searchParams.has("download") ? "attachment" : "inline";
        const baseHeaders: Record<string, string> = {
          "cache-control": "public, max-age=31536000, immutable",
          "content-disposition": `${disposition}; filename="${encodeURIComponent(filename)}"`,
          "accept-ranges": "bytes",
        };
        const contentType = data.type || "application/octet-stream";
        const size = data.size;

        const range = request.headers.get("range");
        if (range) {
          const match = /bytes=(\d*)-(\d*)/.exec(range);
          if (match) {
            let start = match[1] ? Number.parseInt(match[1], 10) : Number.NaN;
            let end = match[2] ? Number.parseInt(match[2], 10) : Number.NaN;
            if (Number.isNaN(start) && !Number.isNaN(end)) {
              start = Math.max(0, size - end);
              end = size - 1;
            }
            if (Number.isNaN(end) || end >= size) end = size - 1;
            if (!Number.isNaN(start) && start >= 0 && start <= end) {
              const chunk = data.slice(start, end + 1, contentType);
              return new Response(chunk, {
                status: 206,
                headers: {
                  ...baseHeaders,
                  "content-type": contentType,
                  "content-range": `bytes ${start}-${end}/${size}`,
                  "content-length": String(end - start + 1),
                },
              });
            }
          }
        }

        return new Response(data, {
          status: 200,
          headers: {
            ...baseHeaders,
            "content-type": contentType,
            "content-length": String(size),
          },
        });
      },
    },
  },
});
