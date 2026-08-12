import { Instagram, Mail, Phone } from "lucide-react";

import { site } from "@/lib/site";
import { Reveal } from "./reveal";

const MAILTO = `mailto:${site.contact.email}?subject=${encodeURIComponent(
  "Collaboration with S.Saha Photography",
)}`;

export function ContactSection() {
  const phone: string = site.contact.phone;

  return (
    <section id="contact" className="border-t border-border/50 px-4 py-20 sm:px-6 md:py-32">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10 lg:gap-20">
        <Reveal className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
            Collaborate
          </p>
          <h2 className="mt-6 font-display text-4xl italic sm:text-5xl md:text-6xl">Let's make frames together</h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            {site.contact.note}
          </p>
        </Reveal>

        <Reveal delay={150} className="min-w-0">
          <div className="divide-y divide-border/50 border-y border-border/50">
            <ContactRow
              icon={<Mail className="h-4 w-4" aria-hidden="true" />}
              label="Email"
              value={site.contact.email}
              href={`mailto:${site.contact.email}`}
            />
            {phone ? (
              <ContactRow
                icon={<Phone className="h-4 w-4" aria-hidden="true" />}
                label="Phone"
                value={phone}
                href={`tel:${phone.replace(/[^+\d]/g, "")}`}
              />
            ) : null}

            <ContactRow
              icon={<Instagram className="h-4 w-4" aria-hidden="true" />}
              label="Instagram"
              value={site.instagramHandle}
              href={site.instagramUrl}
              external
            />
          </div>

          <a
            href={MAILTO}
            className="mt-10 inline-flex min-h-12 max-w-full items-center justify-center gap-3 bg-accent px-6 py-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-accent-foreground ring-1 ring-accent transition-colors hover:bg-transparent hover:text-accent sm:px-8"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            Start a conversation
          </a>
        </Reveal>
      </div>
    </section>
  );
}

interface ContactRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}

function ContactRow({ icon, label, value, href, external }: ContactRowProps) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-6 transition-colors hover:text-accent"
    >
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 break-words font-display text-lg italic sm:text-xl md:text-2xl">{value}</p>
      </div>
      <span className="shrink-0 text-muted-foreground transition-colors group-hover:text-accent">
        {icon}
      </span>
    </a>
  );
}
