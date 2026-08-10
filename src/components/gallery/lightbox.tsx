import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";

import { mediaDownloadUrl, mediaUrl, type MediaItem } from "@/lib/media";

interface LightboxProps {
  items: MediaItem[];
  currentId: string;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export function Lightbox({ items, currentId, onClose, onNavigate }: LightboxProps) {
  const index = items.findIndex((item) => item.id === currentId);
  const item = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);

  const go = useCallback(
    (direction: 1 | -1) => {
      if (items.length < 2 || index < 0) return;
      const next = items[(index + direction + items.length) % items.length];
      if (next) onNavigate(next.id);
    },
    [index, items, onNavigate],
  );

  useEffect(() => {
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);

  if (!item) return null;

  const meta = [item.location, item.taken_year].filter(Boolean).join(" · ");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="animate-reveal fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-6 backdrop-blur-sm [animation-duration:300ms]"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 z-10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-accent"
      >
        Close
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      <div
        className="grid w-full max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-14"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-center md:col-span-8">
          {item.media_type === "video" ? (
            <video
              key={item.id}
              src={mediaUrl(item.file_path)}
              controls
              autoPlay
              playsInline
              className="max-h-[70vh] w-full object-contain"
            />
          ) : (
            <img
              key={item.id}
              src={mediaUrl(item.file_path)}
              alt={item.caption ? `${item.title} — ${item.caption}` : item.title}
              className="max-h-[70vh] w-full object-contain"
            />
          )}
        </div>

        <div className="md:col-span-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </p>
          <h2 className="mt-4 font-display text-3xl italic md:text-4xl">{item.title}</h2>
          {meta ? (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {meta}
            </p>
          ) : null}
          {item.caption ? (
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{item.caption}</p>
          ) : null}

          <a
            href={mediaDownloadUrl(item.file_path)}
            className="mt-8 flex w-full items-center justify-center gap-3 bg-accent py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-foreground ring-1 ring-accent transition-colors hover:bg-transparent hover:text-accent"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download full quality
          </a>

          {items.length > 1 ? (
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous piece"
                className="flex h-12 flex-1 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next piece"
                className="flex h-12 flex-1 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
