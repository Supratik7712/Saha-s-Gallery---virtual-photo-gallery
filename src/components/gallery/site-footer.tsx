import { Link } from "@tanstack/react-router";

import { site } from "@/lib/site";
import { ExternalLink } from "./external-link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-screen-xl flex-col items-start justify-between gap-8 sm:items-center md:flex-row">
        <p className="max-w-full font-mono text-[9px] leading-5 uppercase tracking-[0.2em] text-muted-foreground sm:text-[10px] sm:tracking-[0.3em]">
          {site.footerNote} © {new Date().getFullYear()} {site.name.toUpperCase()}
        </p>
        <div className="flex items-center gap-8">
          <ExternalLink
            href={site.supportUrl}
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent transition-colors hover:text-foreground"
          >
            Support me
          </ExternalLink>
          <ExternalLink
            href={site.instagramUrl}
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-accent"
          >
            Instagram
          </ExternalLink>
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
