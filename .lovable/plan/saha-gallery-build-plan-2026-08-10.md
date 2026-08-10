# Saha Gallery — Build Plan

A dark, cinematic personal gallery where you showcase your best photos and videos with captions, and anyone can download them in full quality. Built on the "Cinematic Noir" direction you picked.

## Design — Cinematic Noir

- Near-black canvas, off-white text, gold accent. Playfair Display italic headlines, Inter body, JetBrains Mono for labels and metadata.
- Full-screen hero: moody monochrome featured image, huge italic "Saha Gallery" wordmark, tagline, thin scroll line.
- Photos / Videos tabs with a gold underline, over an asymmetric editorial grid (mixed tile sizes, staggered offsets).
- Clicking a work opens a full-screen lightbox: large preview, title, caption, location/year, gold Download button, previous/next navigation. Deep-linkable via URL.
- Inverted About section (light panel) with your portrait, short bio, and Instagram handle.
- Minimal nav and footer with Instagram link-out; smooth reveal-on-scroll and slow hover-zoom motion.
- Fully responsive — the grid stacks cleanly on mobile.

## Pages

1. `/` — public gallery: hero, Photos/Videos tabs, grid, lightbox, About, footer.
2. `/auth` — your private login (email/password + Google sign-in).
3. `/admin` — protected upload & manage page: upload a photo or video, set title/caption/location/year, delete items. Not linked publicly.

## Backend (Lovable Cloud)

- Enable Lovable Cloud (database, storage, auth — no external accounts needed).
- `media_items` table: title, caption, location, year, type (photo/video), file path, dimensions, sort order.
- Public `gallery` storage bucket holding the original files.
- Row-level security: everyone can read gallery items; only your admin account can upload, edit, or delete (role check via a separate `user_roles` table — never on the profile).
- Public reads go through a safe read-only server function; admin writes go through authenticated server functions.
- No public accounts or profiles — the only user is you.

## Downloads

Every photo and video gets a Download button that fetches the original full-quality file straight from storage.

## One-time setup after the build

1. You open `/auth` and create your account.
2. Tell me — I'll grant that account the admin role (one quick step on my side).
3. Optionally disable new sign-ups so only you can ever log in.

## Generated assets

- Hero: cinematic black-and-white architectural photograph.
- About: grainy B&W photographer portrait.

The gallery grid itself starts empty with an elegant "awaiting its first frame" state — your uploads fill it via `/admin`.

## SEO & polish

Unique title/description and social tags per page, semantic HTML, alt text on images, lazy loading.

## Technical details

- TanStack Start routes; Tailwind v4 tokens in `src/styles.css` (oklch); fonts loaded via `<link>` in the root route head.
- Tabs and lightbox state live in URL search params (`?tab=videos`, `?item=<id>`) so views are shareable.
- Data via `createServerFn` + TanStack Query (`ensureQueryData` in loaders, `useSuspenseQuery` in components); admin functions guarded by `requireSupabaseAuth` + role check; browser uploads files directly to storage, then saves metadata.
- Lightbox built on the shadcn dialog; tabs styled custom to match the direction.

## Steps

1. Enable Lovable Cloud.
2. Design tokens, fonts, base styles (Cinematic Noir palette carried over exactly).
3. Database migration (`media_items`, `user_roles`, `has_role`, grants, policies) + storage bucket and its policies.
4. Generate hero and About images.
5. Public gallery: nav, hero, tabs, grid, lightbox with download, About, footer.
6. Auth page (email/password + Google).
7. Admin upload/manage page.
8. SEO metadata, empty states, mobile pass, preview verification.
