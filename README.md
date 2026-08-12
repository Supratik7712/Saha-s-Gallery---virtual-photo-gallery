# Saha's Gallery

A virtual exhibition of what I see through my lens — a part of S.SAHA Photography.

Saha's Gallery is a dark, cinematic online gallery for photographs and video work. Every piece carries its own caption, location and year, and every piece is free for anyone to view and download in full quality.

- **Live site:** https://sahasgallery.lovable.app
- **Instagram:** [@s.saha_photography](https://www.instagram.com/s.saha_photography/)

---

## Features

**Gallery experience**
- Cinematic-noir visual direction: near-black canvas, off-white type, gold accents, Playfair Display italic headlines with Inter body and mono metadata.
- Full-bleed hero with the gallery wordmark and tagline.
- **Photos / Videos tabs** to switch collections, with the active tab reflected in the URL so views are shareable.
- **Search** across titles, captions, locations and filenames — filtering happens instantly without the page jumping around.
- **Uniform tile grid**: every work sits in an identically sized frame, so nothing is cropped or over-zoomed. Captions and metadata fade in over a gradient on hover/tap.
- **Full-screen lightbox** with a large preview, title, caption, location and year, previous/next navigation, and a one-click **full-quality download**.
- **Live viewer count** — a pulsing indicator showing how many people are browsing the gallery right now, powered by realtime presence.
- About section and a contact section for collaborations, editorial work and brand partnerships (email and phone, with a one-tap mail link).
- Responsive from small phones through tablets to large desktops.

**Behind the scenes**
- A private, credential-protected curator area for uploading work, editing metadata, reordering and deleting items. It is not linked from the public site and is restricted to a single authorised account.
- **Audience analytics**: session-based visit tracking with live, daily, unique and weekly counts.
- **MCP agent integration** — the app exposes a Model Context Protocol server so AI clients can browse the collection, fetch a single item with its download path, and (for the authorised curator only) update item metadata.

---

## Screenshots

Drop images into `docs/` and they will render here.

| Home | Lightbox |
| --- | --- |
| ![Home](docs/screenshot-home.png) | ![Lightbox](docs/screenshot-lightbox.png) |

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [TanStack Start](https://tanstack.com/start) v1 (React 19, SSR) |
| Routing | TanStack Router (file-based routes) |
| Data | TanStack Query + typed server functions (`createServerFn`) |
| Styling | Tailwind CSS v4 (theme tokens in `src/styles.css`, `oklch` palette) |
| UI primitives | Radix UI / shadcn-style components, Lucide icons, Sonner toasts |
| Validation | Zod |
| Backend | Managed Postgres + Auth + Storage + Realtime |
| Agents | `@lovable.dev/mcp-js` MCP server with OAuth |
| Build | Vite 7, deployed to an edge runtime |

---

## Architecture

```text
Browser ──► TanStack Start route ──► server function ──► Postgres (RLS)
                    │                        │
                    │                        └──► Storage bucket (original files)
                    └──► /api/media/*  ──► streams & downloads originals
```

**Routes**
| Route | Purpose |
| --- | --- |
| `/` | Public gallery: hero, tabs, search, grid, lightbox, about, contact, footer |
| `/api/media/*` | Public streaming + download endpoint for original media files |
| `/mcp` | MCP server endpoint for AI agents (OAuth protected) |
| Curator area | Private, authenticated management screens (upload, edit, delete, audience stats) |

**Data model**
| Table | Contents |
| --- | --- |
| `media_items` | title, caption, location, year, media type (photo/video), storage path, mime type, dimensions, sort order |
| `user_roles` | role assignments kept in a dedicated table (never on a profile row) and checked through a security-definer helper |
| `gallery_visits` | anonymous session visit records used for the audience panel |

**Security model**
- Row Level Security is enabled on every table, with explicit grants per role.
- Public visitors get read-only access to gallery items; all writes require an authenticated session **and** the curator role.
- Public reads run through a read-only server function using the publishable key; privileged writes run through authenticated server functions that verify the caller's role before touching data.
- New public sign-ups are disabled — the gallery has exactly one account holder, and no visitor accounts or profiles exist.
- Original files live in a storage bucket that is served through the app's own media endpoint rather than exposing raw bucket URLs.

Secrets (service keys, database passwords, the curator's credentials) are **not** part of this repository and are never referenced in code or docs.

---

## Local development

**Prerequisites:** Node.js 20+ and npm (or [Bun](https://bun.sh)).

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
cp .env.example .env   # then fill in your own backend values
npm run dev
```

The dev server runs at http://localhost:8080.

**Scripts**

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over the whole project |
| `npm run format` | Prettier write |

---

## Environment variables

Copy `.env.example` to `.env` and provide values from your own backend project. Only names and purposes are documented here — never commit real credentials.

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Backend API base URL (browser-safe) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable/anon key used by the browser client (browser-safe) |
| `VITE_SUPABASE_PROJECT_ID` | Backend project reference, used for the MCP OAuth issuer |
| `SUPABASE_URL` | Same base URL, read by server functions |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key used for public server-side reads |
| `SUPABASE_PROJECT_ID` | Project reference, server side |

Server-only privileged keys are supplied by the hosting environment and must never be added to the repository, logged, or referenced in client code.

---

## Project structure

```text
src/
├── assets/                     generated & uploaded imagery
├── components/
│   ├── gallery/                hero, nav, grid, lightbox, about, contact,
│   │                           footer, live viewers, visit tracking, stats
│   └── ui/                     shadcn-style primitives
├── hooks/
├── integrations/               generated backend client + auth helpers
├── lib/
│   ├── media.functions.ts      public read + curator write server functions
│   ├── media-admin.server.ts   role verification helper (server only)
│   ├── visits.functions.ts     visit tracking & audience stats
│   ├── site.ts                 site copy, links, contact details
│   └── mcp/                    MCP server definition and tools
├── routes/                     file-based routes (public, api, mcp, private)
├── styles.css                  Tailwind v4 theme tokens
└── router.tsx
supabase/                       backend config & migrations
public/                         static assets, robots.txt
```

---

## Deployment

The project is built and hosted through [Lovable](https://lovable.dev) — pushing to the default branch keeps the repository and the Lovable project in sync in both directions. The output is a standard TanStack Start build, so it can also be deployed to any edge/serverless host that supports it, provided the environment variables above are configured there.

## Using the MCP server

Once deployed, AI clients can connect to `https<your-domain>/mcp`. Available tools:

| Tool | Access | Description |
| --- | --- | --- |
| `list_gallery_items` | public | Browse or search the collection |
| `get_gallery_item` | public | One item's details and download path |
| `update_gallery_item` | curator only | Edit title, caption, location, year, ordering |

Curator-only tools are enforced server side by the same role check the web app uses — an unauthorised agent simply gets nothing back.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Source code is released under the [MIT License](LICENSE).

**Photographs and video content are not covered by that license.** All imagery in this gallery is © Supratik Saha. Downloads are offered for personal enjoyment; please ask before commercial use.

## Credits

Photography, direction and words by **Supratik Saha** — [@s.saha_photography](https://www.instagram.com/s.saha_photography/).
