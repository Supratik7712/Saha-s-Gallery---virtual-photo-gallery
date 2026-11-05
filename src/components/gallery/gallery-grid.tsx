import { Download, Play, Search, X } from "lucide-react";

import { mediaDownloadUrl, mediaUrl, type MediaItem } from "@/lib/media";
import { site } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";
import { LiveViewers } from "./live-viewers";


type GalleryTab = "photos" | "videos";


interface GalleryGridProps {
  items: MediaItem[];
  activeTab: GalleryTab;
  counts: { photos: number; videos: number };
  onTabChange: (tab: GalleryTab) => void;
  onSelect: (id: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
}

export function GalleryGrid({
  items,
  activeTab,
  counts,
  onTabChange,
  onSelect,
  query,
  onQueryChange,
}: GalleryGridProps) {
  const searching = query.trim().length > 0;

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-20 sm:px-6 md:py-32">
      <div className="mb-12 flex flex-col justify-between gap-8 border-b border-border/50 pb-8 md:mb-20 md:flex-row md:items-end">
        <div className="flex gap-5 sm:gap-8">
          {(["photos", "videos"] as const).map((tab) => (
            <Button
              variant="ghost"
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              aria-pressed={activeTab === tab}
              className={`h-11 rounded-none px-0 pb-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors hover:bg-transparent sm:text-xs sm:tracking-[0.2em] ${
                activeTab === tab
                  ? "border-b border-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "photos" ? `Photography ${counts.photos}` : `Motion ${counts.videos}`}
            </Button>
          ))}
        </div>
        <div className="flex w-full max-w-sm flex-col items-start gap-3 md:items-end">
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search captions or filenames"
              aria-label="Search photos and videos by caption or filename"
              className="h-12 w-full min-w-0 border border-border/60 bg-secondary/40 pr-12 pl-9 text-base text-foreground placeholder:text-xs placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            />
            {searching ? (
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-0 h-11 w-11 -translate-y-1/2 text-muted-foreground transition-colors hover:bg-transparent hover:text-accent"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </div>
          <LiveViewers />
          {site.intro ? (
            <p className="text-left font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-muted-foreground md:text-right">
              {site.intro}
            </p>
          ) : null}
        </div>

      </div>

      {items.length === 0 ? (
        <div className="py-32 text-center">
          <p className="font-display text-3xl italic text-foreground">
            {searching ? "No frames match that search." : "The gallery awaits its first frame."}
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {searching
              ? "Try another caption, title or filename"
              : "New works are being developed in the darkroom — check back soon"}
          </p>
        </div>
      ) : (

        <div
          key={activeTab}
          className="animate-reveal grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12"
        >
          {items.map((item, index) => (
            <GalleryCard key={item.id} item={item} index={index} onSelect={onSelect} />
          ))}
        </div>
      )}
    </section>
  );
}

interface GalleryCardProps {
  item: MediaItem;
  index: number;
  onSelect: (id: string) => void;
}

function GalleryCard({ item, index, onSelect }: GalleryCardProps) {
  const meta = [item.location, item.taken_year].filter(Boolean).join(" · ");

  return (
    <Reveal className="group" delay={(index % 3) * 100}>
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        aria-label={`Open ${item.title}`}
        className="relative block aspect-[4/5] w-full cursor-crosshair overflow-hidden border border-border/50 bg-secondary text-left ring-accent/0 transition-all duration-500 hover:border-accent/40 hover:ring-1 hover:ring-accent/40"
      >
        {item.media_type === "video" ? (
          <video
            src={mediaUrl(item.file_path)}
            muted
            playsInline
            loop
            preload="metadata"
            onMouseEnter={(e) => void e.currentTarget.play().catch(() => undefined)}
            onMouseLeave={(e) => e.currentTarget.pause()}
            className="h-full w-full object-contain"
          />
        ) : (
          <img
            src={mediaUrl(item.file_path)}
            alt={item.caption ? `${item.title} — ${item.caption}` : item.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain"
          />
        )}

        {item.media_type === "video" ? (
          <span className="absolute top-4 right-4 flex items-center gap-2 bg-background/70 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground backdrop-blur-sm">
            <Play className="h-3 w-3" aria-hidden="true" />
            Motion
          </span>
        ) : null}

        {/* Gradient scrim + title reveal */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <h3 className="truncate font-display text-xl italic text-foreground">{item.title}</h3>
          {meta ? (
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em] text-accent">
              {meta}
            </p>
          ) : null}
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
            Click to view
          </p>
        </div>
      </button>

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </p>
        <a
          href={mediaDownloadUrl(item.file_path)}
          aria-label={`Download ${item.title}`}
          title="Download full quality"
          className="flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-accent"
        >
          <Download className="h-4 w-4" />
        </a>
      </div>
    </Reveal>
  );
}
