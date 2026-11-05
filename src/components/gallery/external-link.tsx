import type { AnchorHTMLAttributes } from "react";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Native new-tab links preserve browser behavior without navigating the preview frame. */
export function ExternalLink({ href, children, ...rest }: Props) {
  return (
    <a {...rest} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
