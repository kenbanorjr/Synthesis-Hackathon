# TreasuryPilot

TreasuryPilot is an org-first treasury operations app for builders, small teams, and DAOs. It monitors treasury strategies, runs a five-agent workflow, optionally spends on premium analytics through a Locus adapter, enforces treasury policy, and records receipts, approvals, and bounded execution state in a full audit trail.

## Product Summary

- Org-scoped workspaces with Google OAuth or demo-auth fallback
- Multi-agent workflow with explicit:
  - Monitor Agent
  - Research Agent
  - Risk Agent
  - Execution Agent
  - Explainer Agent
- Policy controls for:
  - monthly budget
  - max spend per action
  - approval threshold
  - allowed providers
  - allowed actions
  - low-risk auto execution
- Locus-shaped spend control with wallet refs, budget checks, receipts, and transaction history adapters
- Bounded execution records with dry-run defaults, idempotency keys, and execution readiness status
- Demo-ready seeded scenario for `USDC Yield Vault`

## Hackathon Alignment

### OpenServ

TreasuryPilot exposes a public OpenServ-facing ingress endpoint at `/api/openserv/agent`. The route now accepts the real `type`-based OpenServ custom-agent envelope, responds to chat/task actions, and still keeps a legacy JSON trigger fallback for internal tools.

### Locus

TreasuryPilot uses a typed Locus adapter for wallet readiness, local budget enforcement, live wrapped-API purchases, receipts, and approval URLs. In local/demo mode the mock adapter still enforces the same policy boundaries, so the workflow stays demoable without external credentials.

## What Is Live vs Fallback

### Live today

- Next.js app router app and dashboard
- Prisma/Postgres data model
- Google OAuth scaffolding through NextAuth
- Organization-scoped policy, strategy, run, receipt, approval, and execution state
- OpenServ custom-agent ingress route with chat/task handling
- Real Locus wrapped-API purchase path when `LOCUS_MODE=real`
- Receipt metadata that records wrapped-provider endpoints and approval URLs

### Bounded or fallback

- Workflow orchestration still runs inside TreasuryPilot. OpenServ is the real ingress and callback rail, not the system's internal execution engine.
- Locus purchases use the typed real adapter when credentials are available; otherwise they fall back to the policy-enforcing mock adapter
- Execution is recorded and policy-bounded, but live execution stays dry-run-first by design until you explicitly enable it and wire a live transfer path

## Architecture

### App

- `app/(marketing)` contains the landing and sign-in experience
- `app/(dashboard)` contains the authenticated operator UI
- `app/api/*` contains policy, strategy, workflow, approval, demo, health, auth, and OpenServ ingress routes

### Core services

- `lib/services/organization-service.ts` bootstraps default organizations and org defaults
- `lib/services/workflow-service.ts` runs the end-to-end multi-agent workflow
- `lib/services/policy-service.ts` enforces treasury guardrails
- `lib/services/payment-service.ts` applies Locus-style budget and receipt logic
- `lib/services/approval-service.ts` resolves approvals and updates execution state
- `lib/services/demo-seed-service.ts` seeds the end-to-end demo workspace

### Integrations

- `lib/integrations/openserv/*` contains the typed OpenServ adapter contract plus real/mock implementations
- `lib/integrations/locus/*` contains the typed Locus adapter contract plus real/mock implementations

## Local Setup

If you previously ran the older single-user schema, reset your local database first:

```bash
docker compose down -v
```

Then run:

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Free Wiring Path

This is the recommended low-cost hackathon path for TreasuryPilot:

1. Use `Neon` for hosted Postgres
2. Deploy the app on `Vercel Hobby`
3. Add `Google OAuth` for production sign-in
4. Register the deployed `/api/openserv/agent` URL in `OpenServ`
5. Get a `Locus` agent API key and credits, then switch `LOCUS_MODE=real`

### Step 1: Neon

- Create a free Neon project and copy the connection string
- Put it in:
  - local [`.env`](./.env)
  - Vercel Project Settings -> Environment Variables
- Key:

```env
DATABASE_URL="your_neon_postgres_url"
```

- After updating local `.env`, run:

```bash
npm run db:push
npm run db:seed
```

### Step 2: Vercel

- Import the GitHub repo into Vercel
- Add the same env vars there
- Deploy first with:
  - local/dev: `OPENSERV_MODE=mock`, `LOCUS_MODE=mock`
  - production hackathon deploy: `OPENSERV_MODE=real`, `LOCUS_MODE=real`
  - `AUTH_ENABLE_DEMO=true` only if Google OAuth is not ready yet
- After deploy, copy the production URL and set:

```env
NEXTAUTH_URL="https://your-app.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

### Step 3: Google OAuth

- In Google Cloud Console, create an OAuth client of type `Web application`
- Add Authorized JavaScript origins:
  - `http://localhost:3000`
  - `https://your-app.vercel.app`
- Add Authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google`
  - `https://your-app.vercel.app/api/auth/callback/google`
- Copy the credentials into local `.env` and Vercel env vars:

```env
AUTH_SECRET="generate_a_long_random_secret"
AUTH_GOOGLE_ID="your_google_client_id"
AUTH_GOOGLE_SECRET="your_google_client_secret"
AUTH_ENABLE_DEMO="false"
```

- Keep `AUTH_ENABLE_DEMO="true"` locally until Google sign-in works

### Step 4: OpenServ

- Create an OpenServ agent and secret key
- Add these env vars locally and in Vercel:

```env
OPENSERV_MODE="real"
OPENSERV_BASE_URL="https://api.openserv.ai"
OPENSERV_API_KEY="your_openserv_api_key"
OPENSERV_AUTH_TOKEN="your_openserv_auth_token"
```

- Register the deployed ingress URL in OpenServ:

```text
https://your-app.vercel.app/api/openserv/agent
```

- OpenServ sends the custom-agent action envelope to that route. TreasuryPilot authorizes inbound requests with `OPENSERV_AUTH_TOKEN`, acknowledges the action, and then reports results back to the OpenServ platform with `OPENSERV_API_KEY` sent in the `X-API-Key` header.

### Step 5: Locus Beta

- Use the Locus docs or dashboard to create an agent API key and request/fund credits
- Save the returned API key securely
- Add these env vars locally and in Vercel:

```env
LOCUS_MODE="real"
LOCUS_BASE_URL="https://api.paywithlocus.com/api"
LOCUS_API_KEY="your_locus_agent_api_key"
```

- TreasuryPilot keeps budget policy local, but the research spend itself now uses the wrapped-API contract at `/wrapped/<provider>/<endpoint>`.

## Demo Flow

1. Open `/signin`
2. Use Google OAuth if configured, or use the demo-auth fallback in local mode
3. Open `/demo`
4. Click `Seed demo workspace`
5. Open `/dashboard` to show the org budget, policy, strategy posture, and latest recommendation
6. Click `Run full workflow`
7. Open `/runs` to show the agent trace, paid receipt, approval state, and execution readiness record
8. Open `/receipts` to show the spend history

## Environment Variables

### Final production block

```env
DATABASE_URL="your_neon_connection_string"
NEXTAUTH_URL="https://your-app.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

AUTH_SECRET="your_generated_secret"
AUTH_GOOGLE_ID="your_google_client_id"
AUTH_GOOGLE_SECRET="your_google_client_secret"
AUTH_ENABLE_DEMO="true"
DEMO_USER_EMAIL="demo@treasurypilot.local"

OPENSERV_MODE="real"
OPENSERV_BASE_URL="https://api.openserv.ai"
OPENSERV_API_KEY="your_openserv_api_key"
OPENSERV_AUTH_TOKEN="your_openserv_auth_token"

LOCUS_MODE="real"
LOCUS_BASE_URL="https://api.paywithlocus.com/api"
LOCUS_API_KEY="your_locus_agent_api_key"
```

### Required for local development

- `DATABASE_URL`
  - What it is: your Postgres connection string
  - Where to get it: use the local Docker value from `.env.example`, or copy a hosted Postgres URL from Neon, Supabase, Railway, or another managed provider
- `NEXTAUTH_URL`
  - What it is: the auth callback base URL
  - Local value: `http://localhost:3000`
- `NEXT_PUBLIC_APP_URL`
  - What it is: the public app URL
  - Local value: `http://localhost:3000`

### Required for production auth

- `AUTH_SECRET`
  - What it is: the session-signing secret
  - How to generate it:
    - `npx auth secret`
    - or `openssl rand -base64 32`
- `AUTH_GOOGLE_ID`
  - What it is: your Google OAuth client id
  - Where to get it: Google Cloud Console → APIs & Services → Credentials → Create OAuth client
- `AUTH_GOOGLE_SECRET`
  - What it is: your Google OAuth client secret
  - Where to get it: the same Google OAuth credential screen
- `AUTH_ENABLE_DEMO`
  - What it is: enables the local demo credentials provider
  - Recommended:
    - local demo: `true`
    - production: `false` once Google OAuth is live

### Optional demo seed identity

- `DEMO_USER_EMAIL`
  - What it is: the email used for the seeded demo operator
  - Where it comes from: choose any local/demo email you want to keep using consistently

### OpenServ

- `OPENSERV_MODE`
  - Local development: `mock`
  - Production hackathon deploy: `real`
- `OPENSERV_BASE_URL`
  - Default: `https://api.openserv.ai`
  - Where to get it: OpenServ docs and dashboard
- `OPENSERV_API_KEY`
  - What it is: the OpenServ API key TreasuryPilot uses when calling the OpenServ platform
  - Where to get it: OpenServ agent creation success screen or OpenServ Developer → Your Agents → Details
- `OPENSERV_AUTH_TOKEN`
  - What it is: the inbound auth token OpenServ sends to your external agent endpoint
  - Where to get it: OpenServ agent creation success screen

To connect the deployed app to OpenServ:

1. Deploy the app
2. Copy the public URL of `/api/openserv/agent`
3. Register that URL as the agent endpoint in OpenServ
4. Save both the OpenServ API key and auth token in Vercel
5. Let TreasuryPilot validate inbound requests with `OPENSERV_AUTH_TOKEN`
6. Let TreasuryPilot call the OpenServ API with `OPENSERV_API_KEY`
7. Leave workflow execution inside TreasuryPilot. OpenServ is the external ingress and callback rail.

### Locus

- `LOCUS_MODE`
  - Local development: `mock`
  - Production hackathon deploy: `real`
- `LOCUS_BASE_URL`
  - Recommended: `https://api.paywithlocus.com/api`
  - Where to get it: Locus docs
- `LOCUS_API_KEY`
  - What it is: your Locus API key
  - Where to get it:
    - hackathon path: create an agent key and request credits
    - production path: Locus dashboard after creating a wallet and generating an API key

When `LOCUS_MODE=real`, TreasuryPilot performs the paid research call through Locus wrapped APIs and records the endpoint, approval URL, and receipt metadata in the audit trail.

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
- `GET /api/openserv/agent`
- `POST /api/openserv/agent`
- `GET /api/auth/[...nextauth]`
- `POST /api/auth/[...nextauth]`

All route handlers return:

```json
{
  "data": {},
  "error": null
}
```

## Verification

These commands are currently passing:

```bash
npm run check
npm test
npm run build
```

## Submission Readiness

The repo now covers the product-side requirements for Synthesis:

- meaningful multi-agent workflow
- working demo path
- public-repo-friendly structure
- explicit receipts and auditability
- collaboration-ready docs

Before you submit, use:

- [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md)
- [CONVERSATION_LOG_TEMPLATE.md](./CONVERSATION_LOG_TEMPLATE.md)

Some submission items are still external and manual:

- joining the official Telegram
- keeping the GitHub repo public and current
- deploying the app
- collecting on-chain artifact links
- filling the final `conversationLog` in the submission flow

## Deployment Notes

- Recommended stack:
  - Vercel Hobby
  - Neon Postgres
  - Google OAuth
  - OpenServ ingress endpoint registration
  - Locus agent API key in `real` mode for wrapped research purchases
- Set `NEXT_PUBLIC_APP_URL` to the deployed URL
- Add the Google OAuth callback URL for your deployed domain
- Run `npm run db:migrate` or `npm run db:push` during environment setup
- Leave `AUTH_ENABLE_DEMO=false` in production once real auth is configured
- Mirror the full env set from [`.env.example`](./.env.example) into Vercel Project Settings -> Environment Variables

## Remaining Real-Integration Work

- Wire a fully direct outbound OpenServ orchestration path if you want OpenServ to own more than the ingress trigger/callback rail
- Expand Locus beyond wrapped research purchases into live transfers or other provider classes
- Enable live execution only after you finalize provider allowlists, destinations, and funding
