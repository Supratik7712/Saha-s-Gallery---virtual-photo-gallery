import type { AnchorHTMLAttributes, MouseEvent } from "react";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/**
 * Opens external URLs in a real new tab. Calling window.open with the
 * "noopener" feature can return null even when a tab was successfully opened,
 * which previously triggered a second navigation inside the embedded preview.
 */
export function ExternalLink({ href, onClick, children, ...rest }: Props) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.button !== 0) return;
    event.preventDefault();

    const opened = window.open(href, "_blank");
    if (opened) {
      opened.opener = null;
    }
  };

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
