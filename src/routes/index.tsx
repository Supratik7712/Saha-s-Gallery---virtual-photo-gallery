import { useCallback, useState } from "react";
import { createFileRoute, useNavigate, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";

import { mediaQueryOptions } from "@/lib/media";
import { SiteNav } from "@/components/gallery/site-nav";
import { Hero } from "@/components/gallery/hero";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { Lightbox } from "@/components/gallery/lightbox";
import { AboutSection } from "@/components/gallery/about-section";
import { ContactSection } from "@/components/gallery/contact-section";
import { SiteFooter } from "@/components/gallery/site-footer";
import { VisitTracker } from "@/components/gallery/visit-tracker";


const searchSchema = z.object({
  tab: fallback(z.string(), "photos").default("photos"),
  item: z.string().optional(),
});


export const Route = createFileRoute("/")({
  validateSearch: zodValidator(searchSchema),
  loader: ({ context }) => context.queryClient.ensureQueryData(mediaQueryOptions),
  head: () => ({
    meta: [
      { title: "Saha's Gallery — A Virtual Exhibition of What I See Through My Lens" },
      {
        name: "description",
        content:
          "Saha Gallery is a virtual exhibition of photography and film. Browse the frames, read their stories, and download every piece in full quality — free.",
      },
      { property: "og:title", content: "Saha Gallery — A Virtual Exhibition of Light & Shadow" },
      {
        property: "og:description",
        content:
          "A virtual exhibition of photography and film. Browse the frames, read their stories, and download every piece in full quality — free.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GalleryPage,
  errorComponent: GalleryError,
});

function GalleryError({ error }: ErrorComponentProps) {
  const router = useRouter();
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="font-display text-4xl italic">The gallery couldn't open</h1>
      <p className="mt-4 max-w-md text-sm text-muted-foreground">
        {message || "Something interrupted the exhibition. Please try again."}
      </p>
      <button
        type="button"
        onClick={() => router.invalidate()}
        className="mt-8 bg-primary px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        Try again
      </button>
    </div>
  );
}

function GalleryPage() {
  const { data: items } = useSuspenseQuery(mediaQueryOptions);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [query, setQuery] = useState("");

  const activeTab: "photos" | "videos" = (search as any).tab === "videos" ? "videos" : "photos";
  const needle = query.trim().toLowerCase();

  const matches = needle
    ? items.filter((item) => {
        const filename = item.file_path.split("/").pop() ?? item.file_path;
        return [item.title, item.caption, item.location, filename]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(needle));
      })
    : items;

  const photos = matches.filter((item) => item.media_type === "photo");
  const videos = matches.filter((item) => item.media_type === "video");
  const visible = activeTab === "photos" ? photos : videos;

  const openItem = (search as any).item ? items.find((item) => item.id === (search as any).item) : undefined;
  const lightboxList =
    openItem && visible.some((item) => item.id === openItem.id) ? visible : items;

  const setTab = useCallback(
    (tab: "photos" | "videos") => {
      void navigate({
        resetScroll: false,
        search: (prev: { tab: string; item?: string }) => ({ ...prev, tab, item: undefined }),
      });
    },
    [navigate],
  );
  const openItemById = useCallback(
    (id: string) => {
      void navigate({
        resetScroll: false,
        search: (prev: { tab: string; item?: string }) => ({ ...prev, item: id }),
      });
    },
    [navigate],
  );
  const closeItem = useCallback(() => {
    void navigate({
      resetScroll: false,
      search: (prev: { tab: string; item?: string }) => ({ ...prev, item: undefined }),
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <VisitTracker />
      <SiteNav />

      <Hero />
      <main>
        <GalleryGrid
          items={visible}
          activeTab={activeTab}
          counts={{ photos: photos.length, videos: videos.length }}
          onTabChange={setTab}
          onSelect={openItemById}
          query={query}
          onQueryChange={setQuery}
        />

        <AboutSection />
        <ContactSection />
      </main>
      <SiteFooter />
      {openItem ? (
        <Lightbox
          items={lightboxList}
          currentId={openItem.id}
          onClose={closeItem}
          onNavigate={openItemById}
        />
      ) : null}
    </div>
  );
}
