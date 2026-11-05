import { Link } from "@tanstack/react-router";
import { Heart, Instagram } from "lucide-react";

import { site } from "@/lib/site";
import { ExternalLink } from "./external-link";

export function SiteNav() {
  return (
    <nav className="fixed top-0 z-50 grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 bg-background/85 px-4 py-2 text-foreground backdrop-blur-md sm:py-3 sm:px-6">
      <Link
        to="/"
        className="min-w-0 truncate font-mono text-[9px] uppercase tracking-[0.2em] sm:text-[10px] sm:tracking-[0.3em]"
        aria-label={`${site.name} — home`}
      >
        {site.navLabel}
      </Link>
      <div className="flex shrink-0 items-center gap-1 sm:gap-6 md:gap-8">
        <ExternalLink
          href={site.supportUrl}
          className="flex min-h-11 items-center gap-1.5 border border-accent px-2.5 font-mono text-[9px] uppercase tracking-[0.15em] text-accent transition-opacity hover:opacity-70 sm:px-3 sm:text-[10px] sm:tracking-[0.2em]"
        >
          <Heart className="h-3 w-3" aria-hidden="true" />
          Support me
        </ExternalLink>
        <ExternalLink
          href={site.instagramUrl}
          aria-label="Instagram (opens in a new tab)"
          title="Instagram — opens in a new tab"
          className="flex h-11 w-11 shrink-0 items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] transition-colors hover:text-accent sm:w-auto"
        >
          <Instagram className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Instagram</span>
        </ExternalLink>
        <div className="hidden h-px w-8 bg-foreground/20 md:block" aria-hidden="true" />
        <a
          href="#about"
          className="hidden min-h-11 items-center font-mono text-[9px] uppercase tracking-[0.15em] transition-colors hover:text-accent sm:flex sm:text-[10px] sm:tracking-[0.3em]"
        >
          About
        </a>
        <a
          href="#contact"
          className="flex min-h-11 items-center px-1 font-mono text-[9px] uppercase tracking-[0.15em] transition-colors hover:text-accent sm:px-0 sm:text-[10px] sm:tracking-[0.3em]"
        >
          Contact
        </a>
      </div>
    </nav>
  );
}


