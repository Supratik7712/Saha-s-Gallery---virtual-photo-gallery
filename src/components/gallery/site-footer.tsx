import { Link } from "@tanstack/react-router";

import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 px-6 py-12">
      <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-8 md:flex-row">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {site.footerNote} © {new Date().getFullYear()} {site.name}
        </p>
        <div className="flex items-center gap-8">
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-accent"
          >
            Instagram
          </a>
          <Link
            to="/auth"
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-accent"
          >
            Curator
          </Link>
        </div>
      </div>
    </footer>
  );
}
