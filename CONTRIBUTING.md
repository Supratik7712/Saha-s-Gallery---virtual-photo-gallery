# Contributing

Thanks for your interest in Saha's Gallery.

## Getting set up

```sh
npm install
cp .env.example .env   # fill in your own backend values
npm run dev
```

The dev server runs at http://localhost:8080.

## Code style

- TypeScript throughout; keep types explicit at module boundaries.
- Formatting is Prettier — run `npm run format` before committing.
- Linting is ESLint — `npm run lint` must pass.
- Styling uses Tailwind v4 semantic tokens defined in `src/styles.css`. Do not hardcode colour utilities such as `text-white` or `bg-[#000]`; use the tokens so theming stays consistent.
- Routes are file-based under `src/routes/`. Never edit `src/routeTree.gen.ts` — it is generated.
- Server logic belongs in server functions (`*.functions.ts`); server-only helpers belong in `*.server.ts` and must never be imported from client components.

## Security

- Never commit credentials, tokens, `.env` files, or anything that identifies a privileged account.
- Every new database table needs Row Level Security plus explicit grants and policies.
- Report a security concern privately rather than opening a public issue.

## Pull requests

1. Branch from the default branch.
2. Keep changes focused; one concern per PR.
3. Describe what changed and why, and include before/after screenshots for visual work.
4. Make sure `npm run lint` and `npm run build` both pass.
