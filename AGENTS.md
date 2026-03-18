# Repository Guidelines

## Project Structure & Module Organization
`app/` contains the Next.js App Router surface: `app/(marketing)` for the landing page, `app/(dashboard)` for the operator UI, and `app/api/*` for route handlers. `components/` holds shared React UI. `lib/services/` contains business workflows, `lib/integrations/` contains real and mock adapters, and `lib/validators/` holds Zod schemas. Database assets live in `prisma/` (`schema.prisma`, migrations, and `seed.ts`). Tests live in `tests/`. Treat `dist/` and `node_modules/` as generated output.

## Build, Test, and Development Commands
`docker compose up -d` starts local Postgres. `npm run dev` starts the app on `http://localhost:3000`. `npm run build` generates the Prisma client and builds production assets. `npm run check` runs `prisma validate` plus strict TypeScript checks. `npm test` runs the full Vitest suite, and `npm run test:watch` is the local watch mode. Database helpers: `npm run db:generate`, `npm run db:push`, `npm run db:migrate`, `npm run db:seed`, and `npm run db:studio`.

## Coding Style & Naming Conventions
Follow the existing TypeScript style: 2-space indentation, double quotes, and semicolons. Use the `@/` path alias instead of deep relative imports. Keep component filenames in kebab-case with PascalCase exports, for example `components/policy-form.tsx` exporting `PolicyForm`. Keep service modules in `lib/services/*-service.ts` and validation schemas in `lib/validators/*`. API handlers should continue returning normalized `{ data, error }` payloads through `lib/api.ts`.

## Testing Guidelines
Place tests in `tests/` using `*.test.ts` or `*.test.tsx`. Use Vitest with `jsdom` and Testing Library for UI behavior, and follow `tests/setup.ts` for shared mocks such as `next/navigation` and `sonner`. No coverage threshold is enforced, so add or update tests for changes to services, API routes, Prisma-backed behavior, and key forms before opening a PR.

## Commit & Pull Request Guidelines
The git history is still sparse (`Build TreasuryPilot MVP`), so use short imperative commit subjects with a clear scope, for example `Add approval route tests`. Keep commits focused. Pull requests should include a brief summary, linked issue when relevant, the commands you ran (`npm run check`, `npm test`), screenshots for dashboard or form changes, and notes for schema, seed, or environment variable updates.

## Environment & Configuration Tips
Copy `.env.example` to `.env` for local work. Keep `OPENSERV_MODE=mock` and `LOCUS_MODE=mock` unless you are explicitly testing live adapters. Never commit secrets or local database credentials. If you change `prisma/schema.prisma`, include the matching migration and seed updates in the same PR.
