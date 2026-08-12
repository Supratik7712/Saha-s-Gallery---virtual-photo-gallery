import heroImage from "@/assets/hero-noir.jpg";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <header className="relative flex min-h-[88svh] flex-col items-center justify-center overflow-hidden px-4 sm:min-h-[92vh] sm:px-6">
      <div className="absolute inset-0 z-0 opacity-40 grayscale">
        <img
          src={heroImage}
          alt="Moody black and white architectural study with a shaft of light across concrete"
          className="animate-slide h-full w-full object-cover"
          width={1920}
          height={1080}
          fetchPriority="high"
        />
      </div>

      <div className="animate-reveal relative z-10 text-center">
        <h1 className="font-display text-6xl leading-none text-balance italic sm:text-8xl md:text-[10vw]">
          {site.name}
        </h1>
        <p className="mx-auto mt-6 max-w-[34rem] whitespace-pre-line font-mono text-[9px] leading-6 uppercase tracking-[0.2em] text-accent sm:text-[11px] sm:tracking-[0.4em]">
          {site.tagline}
        </p>
      </div>

      <div className="animate-reveal absolute bottom-8 left-1/2 -translate-x-1/2 sm:bottom-12 [animation-delay:400ms]">
        <div className="h-16 w-px bg-gradient-to-b from-foreground to-transparent" />
      </div>
    </header>
  );
}
