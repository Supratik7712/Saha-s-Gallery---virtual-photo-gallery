import { Download, Play } from "lucide-react";

import { mediaDownloadUrl, mediaUrl, type MediaItem } from "@/lib/media";
import { site } from "@/lib/site";
import { Reveal } from "./reveal";

type GalleryTab = "photos" | "videos";

/** Editorial rhythm: alternating spans, aspects, and vertical offsets. */
const PATTERN = [
  { span: "md:col-span-7", aspect: "aspect-[4/5]", offset: "" },
  { span: "md:col-span-5", aspect: "aspect-[3/4]", offset: "md:mt-32" },
  { span: "md:col-span-12", aspect: "aspect-[21/9]", offset: "" },
  { span: "md:col-span-5", aspect: "aspect-square", offset: "md:mt-24" },
  { span: "md:col-span-7", aspect: "aspect-[16/10]", offset: "" },
  { span: "md:col-span-6", aspect: "aspect-[3/4]", offset: "md:mt-16" },
  { span: "md:col-span-6", aspect: "aspect-[4/5]", offset: "" },
] as const;

interface GalleryGridProps {
  items: MediaItem[];
  activeTab: GalleryTab;
  counts: { photos: number; videos: number };
  onTabChange: (tab: GalleryTab) => void;
  onSelect: (id: string) => void;
}

export function GalleryGrid({ items, activeTab, counts, onTabChange, onSelect }: GalleryGridProps) {
  return (
    <section className="mx-auto max-w-screen-xl px-6 py-24 md:py-32">
      <div className="mb-16 flex flex-col justify-between gap-8 border-b border-border/50 pb-8 md:mb-20 md:flex-row md:items-end">
        <div className="flex gap-8">
          {(["photos", "videos"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              aria-pressed={activeTab === tab}
              className={`pb-2 font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
                activeTab === tab
                  ? "border-b border-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "photos" ? `Photography ${counts.photos}` : `Motion ${counts.videos}`}
            </button>
          ))}
        </div>
        <p className="max-w-xs text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-muted-foreground">
          {site.intro}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-32 text-center">
          <p className="font-display text-3xl italic text-foreground">
            The gallery awaits its first frame.
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            New works are being developed in the darkroom — check back soon
          </p>
        </div>
      ) : (
        <div
          key={activeTab}
          className="animate-reveal grid grid-cols-1 gap-x-12 gap-y-20 md:grid-cols-12 md:gap-y-32"
        >
          {items.map((item, index) => (
            <GalleryCard
              key={item.id}
              item={item}
              pattern={PATTERN[index % PATTERN.length]!}
              index={index}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface GalleryCardProps {
  item: MediaItem;
  pattern: (typeof PATTERN)[number];
  index: number;
  onSelect: (id: string) => void;
}

function GalleryCard({ item, pattern, index, onSelect }: GalleryCardProps) {
  const hasDims = Boolean(item.width && item.height);
  const meta = [item.location, item.taken_year].filter(Boolean).join(" · ");

  return (
    <Reveal
      className={`group col-span-1 ${pattern.span} ${pattern.offset}`}
      delay={(index % 3) * 100}
    >
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        aria-label={`Open ${item.title}`}
        className="block w-full cursor-crosshair text-left"
      >
        <div
          className={`relative overflow-hidden border border-border/50 bg-secondary ${
            hasDims ? "" : pattern.aspect
          }`}
          style={hasDims ? { aspectRatio: `${item.width} / ${item.height}` } : undefined}
        >
          {item.media_type === "video" ? (
            <>
              <video
                src={mediaUrl(item.file_path)}
                muted
                playsInline
                loop
                preload="metadata"
                onMouseEnter={(e) => void e.currentTarget.play().catch(() => undefined)}
                onMouseLeave={(e) => e.currentTarget.pause()}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <span className="absolute top-4 right-4 flex items-center gap-2 bg-background/70 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground backdrop-blur-sm">
                <Play className="h-3 w-3" aria-hidden="true" />
                Motion
              </span>
            </>
          ) : (
            <img
              src={mediaUrl(item.file_path)}
              alt={item.caption ? `${item.title} — ${item.caption}` : item.title}
              loading="lazy"
              width={item.width ?? undefined}
              height={item.height ?? undefined}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          )}
        </div>
      </button>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg italic">{item.title}</h3>
          {meta ? (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {meta}
            </p>
          ) : null}
        </div>
        <a
          href={mediaDownloadUrl(item.file_path)}
          aria-label={`Download ${item.title}`}
          title="Download full quality"
          className="mt-1 shrink-0 text-muted-foreground transition-colors hover:text-accent"
        >
          <Download className="h-4 w-4" />
        </a>
      </div>
    </Reveal>
  );
}
