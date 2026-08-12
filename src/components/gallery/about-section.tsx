import portrait from "@/assets/about-portrait.webp.asset.json";
import { site } from "@/lib/site";
import { ExternalLink } from "./external-link";
import { Reveal } from "./reveal";

export function AboutSection() {
  return (
    <section id="about" className="bg-foreground py-20 text-background md:py-32">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 items-center gap-14 px-4 sm:px-6 md:grid-cols-2 md:gap-24">
        <Reveal className="relative">
          <img
            src={portrait.url}
            alt="Supratik Saha holding a camera in front of a colourful city illustration"
            loading="lazy"
            width={800}
            height={1000}
            className="aspect-[4/5] w-full object-contain"
          />
          <div
            className="absolute -right-8 -bottom-8 hidden h-48 w-48 bg-accent md:block"
            aria-hidden="true"
          />
        </Reveal>


        <Reveal delay={150}>
          <h2 className="mb-10 font-display text-4xl italic md:mb-12 md:text-6xl">
            {site.aboutHeading}
          </h2>
          <div className="space-y-6 text-lg leading-relaxed opacity-90">
            {site.aboutBody.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-12 flex min-w-0 flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
            <ExternalLink
              href={site.instagramUrl}
              className="max-w-full break-all font-mono text-xs uppercase tracking-[0.15em] underline decoration-accent underline-offset-8 sm:text-sm sm:tracking-[0.2em]"
            >
              {site.instagramHandle}
            </ExternalLink>
            <span className="font-mono text-sm uppercase tracking-[0.2em] opacity-50">
              Archive.v2
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
