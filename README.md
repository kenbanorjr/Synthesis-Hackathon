# TreasuryPilot

TreasuryPilot is a production-leaning MVP for treasury operations across builders, small teams, and DAOs. It monitors a strategy, runs a typed multi-agent workflow through OpenServ, optionally buys premium analytics through Locus, applies treasury policy guardrails, and records every spend and decision in an auditable trail.

## What It Does

- Seeds a realistic treasury scenario around a `USDC Yield Vault`
- Runs five explicit agent roles:
  - Monitor Agent
  - Research Agent
  - Risk Agent
  - Execution Agent
  - Explainer Agent
- Enforces treasury policy:
  - monthly budget
  - max spend per action
  - approval threshold
  - allowed providers
  - allowed actions
  - low-risk auto-execution toggle
- Purchases premium analytics through a typed Locus adapter with receipts and transaction history
- Presents a polished dashboard for:
  - strategy health
  - budget posture
  - latest recommendation
  - agent runs
  - receipts and approvals

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI components
- Prisma
- PostgreSQL
- Zod
- React Hook Form
- Vitest + Testing Library

## Architecture

### App

- `app/(marketing)` contains the landing page
- `app/(dashboard)` contains the operator UI
- `app/api` contains route handlers for policy, strategy, workflow, receipts, approvals, demo, and health

### Services

- `lib/services/policy-service.ts` handles policy upserts and guardrail evaluation
- `lib/services/payment-service.ts` handles budget snapshots, Locus purchases, and receipts
- `lib/services/workflow-service.ts` orchestrates the full agent run lifecycle
- `lib/services/dashboard-service.ts` builds server-side dashboard view models
- `lib/services/demo-seed-service.ts` creates the local demo workspace

### Integrations

- `lib/integrations/openserv/*` defines the OpenServ interface, real adapter, and mock adapter
- `lib/integrations/locus/*` defines the Locus interface, real adapter, and mock adapter

## OpenServ Track Fit

OpenServ powers the core multi-agent behavior. TreasuryPilot uses a typed adapter and a clear workflow contract that produces structured outputs for the Monitor, Research, Risk, Execution, and Explainer agents. In local mode, a deterministic mock adapter preserves the same orchestration flow.

## Locus Track Fit

Locus powers the spend-control and payment layer. TreasuryPilot uses a typed adapter for wallet references, budget snapshots, analytics purchases, approval gating, receipts, and transaction history. In local mode, the mock adapter still enforces budgets and approvals, so the full flow remains demoable without credentials.

## Local Setup

1. Copy the environment file:

```bash
cp .env.example .env
```

2. Start Postgres:

```bash
docker compose up -d
```

3. Install dependencies:

```bash
npm install
```

4. Generate Prisma client and apply schema:

```bash
npm run db:generate
npx prisma migrate dev --name init
```

5. Seed the demo workspace:

```bash
npm run db:seed
```

6. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Flow

1. Open `/demo`
2. Click `Seed demo workspace`
3. Open `/dashboard` and show the seeded budget and strategy posture
4. Click `Run full workflow`
5. Open `/runs` to walk through the full multi-agent timeline
6. Open `/receipts` to show the Locus receipt and approval trail

## API Surface

- `GET /api/policies`
- `POST /api/policies`
- `GET /api/strategies`
- `POST /api/strategies`
- `POST /api/agent/run`
- `GET /api/agent/runs`
- `GET /api/receipts`
- `POST /api/approvals/[id]/approve`
- `POST /api/approvals/[id]/reject`
- `POST /api/demo/seed`
- `POST /api/demo/run`
- `GET /api/dashboard`
- `GET /api/health`

All route handlers return normalized payloads in the form:

```json
{
  "data": {},
  "error": null
}
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL`: app base URL
- `DEMO_USER_EMAIL`: seeded operator identity used by the no-auth MVP
- `OPENSERV_MODE`: `mock` or `real`
- `OPENSERV_BASE_URL`: real OpenServ endpoint
- `OPENSERV_API_KEY`: real OpenServ API key
- `LOCUS_MODE`: `mock` or `real`
- `LOCUS_BASE_URL`: real Locus endpoint
- `LOCUS_API_KEY`: real Locus API key

## Real Integration Notes

### OpenServ

To use a live OpenServ backend:

- set `OPENSERV_MODE=real`
- set `OPENSERV_BASE_URL`
- set `OPENSERV_API_KEY`
- expose a compatible `/health` and `/workflows/treasury-pilot` interface

If the live endpoint is missing or unhealthy, the app falls back to the typed mock adapter so the product still runs locally.

### Locus

To use a live Locus backend:

- set `LOCUS_MODE=real`
- set `LOCUS_BASE_URL`
- set `LOCUS_API_KEY`
- expose compatible wallet, budget, purchase, and transaction endpoints

If the live endpoint is missing or unhealthy, the app falls back to the typed mock adapter that still enforces:

- provider whitelist
- max spend per action
- monthly budget
- approval threshold

## Tests

Run the lightweight test suite with:

```bash
npm test
```

Coverage includes:

- policy validation and guardrail enforcement
- budget and approval handling in the mock Locus adapter
- workflow decision resolution
- key API routes
- policy form and demo action smoke tests

## Deployment Notes

- Deploy the Next.js app to Vercel or any Node-compatible platform
- Use a managed PostgreSQL provider such as Neon, Supabase, or Railway
- Run Prisma migrations during deploy
- Keep the MVP in `mock` mode for demos if OpenServ or Locus credentials are not available yet
