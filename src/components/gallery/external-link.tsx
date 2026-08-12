import type { AnchorHTMLAttributes, MouseEvent } from "react";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/**
 * Opens external URLs in a real new tab. Inside embedded previews a plain
 * target="_blank" can be forced into the frame, and sites like Instagram
 * refuse to be framed ("blocked"). We open explicitly and fall back to
 * top-level navigation when the popup is suppressed.
 */
export function ExternalLink({ href, onClick, children, ...rest }: Props) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.button !== 0) return;
    event.preventDefault();

    const opened = window.open(href, "_blank", "noopener,noreferrer");
    if (opened) {
      opened.opener = null;
      return;
    }

    try {
      if (window.top) window.top.location.href = href;
      else window.location.href = href;
    } catch {
      window.location.href = href;
    }
  };

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
