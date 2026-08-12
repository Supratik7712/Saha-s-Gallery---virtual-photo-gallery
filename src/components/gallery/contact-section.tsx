import { Instagram, Mail, Phone } from "lucide-react";

import { site } from "@/lib/site";
import { Reveal } from "./reveal";

export function ContactSection() {
  const phone: string = site.contact.phone;

  return (
    <section id="contact" className="border-t border-border/50 px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-14 md:grid-cols-12 md:gap-20">
        <Reveal className="md:col-span-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
            Collaborate
          </p>
          <h2 className="mt-6 font-display text-4xl italic md:text-6xl">Let's make frames together</h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            {site.contact.note}
          </p>
        </Reveal>

        <Reveal delay={150} className="md:col-span-7">
          <div className="divide-y divide-border/50 border-y border-border/50">
            <ContactRow
              icon={<Mail className="h-4 w-4" aria-hidden="true" />}
              label="Email"
              value={site.contact.email}
              href={`mailto:${site.contact.email}`}
              external
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
            href={`mailto:${site.contact.email}?subject=Collaboration%20with%20S.Saha%20Photography`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-3 bg-accent px-8 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-foreground ring-1 ring-accent transition-colors hover:bg-transparent hover:text-accent"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
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
        <p className="mt-2 truncate font-display text-xl italic md:text-2xl">{value}</p>
      </div>
      <span className="shrink-0 text-muted-foreground transition-colors group-hover:text-accent">
        {icon}
      </span>
    </a>
  );
}
