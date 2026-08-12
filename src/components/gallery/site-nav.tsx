import { Link } from "@tanstack/react-router";

import { site } from "@/lib/site";

export function SiteNav() {
  return (
    <nav className="fixed top-0 z-50 flex w-full items-center justify-between px-6 py-7 text-foreground mix-blend-difference">
      <Link
        to="/"
        className="font-mono text-[10px] uppercase tracking-[0.3em]"
        aria-label={`${site.name} — home`}
      >
        {site.navLabel}
      </Link>
      <div className="flex items-center gap-6 md:gap-8">
        <a
          href={site.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[10px] uppercase tracking-[0.3em] transition-colors hover:text-accent"
        >
          Instagram
        </a>
        <div className="hidden h-px w-8 bg-foreground/20 md:block" aria-hidden="true" />
        <a
          href="#about"
          className="font-mono text-[10px] uppercase tracking-[0.3em] transition-colors hover:text-accent"
        >
          About
        </a>
        <a
          href="#contact"
          className="font-mono text-[10px] uppercase tracking-[0.3em] transition-colors hover:text-accent"
        >
          Contact
        </a>
      </div>
    </nav>
  );
}


