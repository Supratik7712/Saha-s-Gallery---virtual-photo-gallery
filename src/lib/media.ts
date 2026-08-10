import { queryOptions } from "@tanstack/react-query";

import { listMedia } from "./media.functions";

export type MediaType = "photo" | "video";

export interface MediaItem {
  id: string;
  title: string;
  caption: string | null;
  location: string | null;
  taken_year: number | null;
  media_type: string;
  file_path: string;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
  created_at: string;
}

/** Public URL that streams a file out of the private gallery bucket. */
export function mediaUrl(filePath: string): string {
  return `/api/media/${filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

/** Same stream, but served with Content-Disposition: attachment. */
export function mediaDownloadUrl(filePath: string): string {
  return `${mediaUrl(filePath)}?download=1`;
}

export const mediaQueryOptions = queryOptions({
  queryKey: ["media"],
  queryFn: () => listMedia(),
  staleTime: 30_000,
});
