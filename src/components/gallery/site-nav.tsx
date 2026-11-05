import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { site } from "@/lib/site";
import { ExternalLink } from "./external-link";

export function SiteNav() {
  return (
    <nav className="fixed top-0 z-50 grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-5 text-foreground mix-blend-difference sm:px-6 sm:py-7">
      <Link
        to="/"
        className="min-w-0 truncate font-mono text-[9px] uppercase tracking-[0.2em] sm:text-[10px] sm:tracking-[0.3em]"
        aria-label={`${site.name} — home`}
      >
        {site.navLabel}
      </Link>
      <div className="flex shrink-0 items-center gap-4 sm:gap-6 md:gap-8">
        <ExternalLink
          href={site.supportUrl}
          className="flex items-center gap-1.5 border border-current px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.15em] transition-opacity hover:opacity-70 sm:px-3 sm:py-2 sm:text-[10px] sm:tracking-[0.2em]"
        >
          <Heart className="h-3 w-3" aria-hidden="true" />
          Support me
        </ExternalLink>
        <ExternalLink
          href={site.instagramUrl}
          className="hidden font-mono text-[10px] uppercase tracking-[0.3em] transition-colors hover:text-accent sm:block"
        >
          Instagram
        </ExternalLink>
        <div className="hidden h-px w-8 bg-foreground/20 md:block" aria-hidden="true" />
        <a
          href="#about"
          className="font-mono text-[9px] uppercase tracking-[0.15em] transition-colors hover:text-accent sm:text-[10px] sm:tracking-[0.3em]"
        >
          About
        </a>
        <a
          href="#contact"
          className="font-mono text-[9px] uppercase tracking-[0.15em] transition-colors hover:text-accent sm:text-[10px] sm:tracking-[0.3em]"
        >
          Contact
        </a>
      </div>
    </nav>
  );
}


