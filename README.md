# TreasuryPilot

TreasuryPilot is a treasury operations cockpit for builders, small teams, and DAOs. It watches treasury strategies, runs a five-agent workflow, buys premium research through Locus when policy allows it, accepts OpenServ-triggered tasks, and records every recommendation, receipt, approval, and execution-ready action in a full audit trail.

## Submission Links

- Live app: `https://synthesis-hackathon-gray.vercel.app`
- GitHub repo: `https://github.com/kenbanorjr/Synthesis-Hackathon`

## Product Summary

- Org-scoped treasury workspace with policies, strategies, runs, receipts, approvals, and execution readiness
- Five-agent workflow:
  - Monitor
  - Research
  - Risk
  - Execution
  - Explainer
- OpenServ custom-agent ingress at `/api/openserv/agent`
- Locus-backed premium research purchases with receipt and approval metadata
- Policy guardrails for spend, providers, actions, and approval thresholds
- Demo-ready USDC treasury scenario for judge walkthroughs

## What Is Real Today

### Live and wired

- Next.js App Router product deployed on Vercel
- Prisma/Postgres data model on Neon
- OpenServ custom-agent ingress with real external agent auth
- Locus wrapped-API purchase path when `LOCUS_MODE=real`
- Receipt metadata for wrapped endpoints and approval URLs
- Org-scoped dashboard, policies, strategies, runs, and receipts UI

### Still intentionally bounded

- Workflow orchestration still runs inside TreasuryPilot rather than inside OpenServ
- Live execution remains dry-run-first by design
- Customer wallet profile is an org-facing identity/destination hook, not a full bring-your-own execution rail
- Mock adapters still exist for local or fallback testing

## Judge Demo Path

The currently reliable production path is:

1. Open `https://synthesis-hackathon-gray.vercel.app/signin`
2. Sign in with Google if configured, or use the development sign-in path if it is enabled in production
3. Open `https://synthesis-hackathon-gray.vercel.app/demo`
4. Click `Seed demo workspace`
5. Show `https://synthesis-hackathon-gray.vercel.app/dashboard`
6. Click `Run full workflow`
7. Open `https://synthesis-hackathon-gray.vercel.app/runs`
8. Open `https://synthesis-hackathon-gray.vercel.app/receipts`

If `/demo` redirects in production, go through `/signin` first and then continue to `/demo`.

## 60–90 Second Demo Script

1. “TreasuryPilot is a treasury operations cockpit with policy-bound agent workflows.”
2. Show the dashboard and point out the budget posture, strategy health, integration readiness, and latest recommendation.
3. Open the demo page and explain that it seeds a realistic USDC treasury scenario.
4. Click `Seed demo workspace`.
5. Click `Run full workflow`.
6. Open the runs page and show the monitor → research → risk → execution → explainer trace.
7. Open the receipts page and show the Locus-backed payment receipt and any approval metadata.
8. Close on the fact that OpenServ handles external agent ingress while Locus handles paid research and receipt rails.

## Environment Variables For Vercel

Use these values in Vercel without quotes:

```env
DATABASE_URL=your_neon_connection_string
NEXTAUTH_URL=https://synthesis-hackathon-gray.vercel.app
NEXT_PUBLIC_APP_URL=https://synthesis-hackathon-gray.vercel.app

AUTH_SECRET=your_generated_secret
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
AUTH_ENABLE_DEMO=true
DEMO_USER_EMAIL=demo@treasurypilot.local

OPENSERV_MODE=real
OPENSERV_BASE_URL=https://api.openserv.ai
OPENSERV_API_KEY=your_openserv_api_key
OPENSERV_AUTH_TOKEN=your_openserv_auth_token

LOCUS_MODE=real
LOCUS_BASE_URL=https://api.paywithlocus.com/api
LOCUS_API_KEY=your_locus_agent_api_key
```

## External Setup Notes

### Neon

- Create a Neon Postgres database
- Put the connection string into `DATABASE_URL`
- Run `npm run db:push`
- Run `npm run db:seed`

### Google OAuth

- Create a web OAuth client in Google Cloud Console
- Authorized JavaScript origins:
  - `http://localhost:3000`
  - `https://synthesis-hackathon-gray.vercel.app`
- Authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google`
  - `https://synthesis-hackathon-gray.vercel.app/api/auth/callback/google`

### OpenServ

- Create an external agent in OpenServ
- Register:

```text
https://synthesis-hackathon-gray.vercel.app/api/openserv/agent
```

- `OPENSERV_AUTH_TOKEN` authenticates OpenServ into TreasuryPilot
- `OPENSERV_API_KEY` lets TreasuryPilot report back to OpenServ via `X-API-Key`

### Locus

- Create or retrieve a Locus agent API key
- Fund the Locus rail with enough credits or USDC for the demo
- Configure allowance, max transaction, and approval threshold for the flow you want to show
- TreasuryPilot uses Locus wrapped APIs at `/wrapped/<provider>/<endpoint>`

## Local Setup

If you need to run locally:

```bash
docker compose down -v
cp .env.example .env
docker compose up -d
npm install
npm run db:push
npm run db:seed
npm run dev
```

Then open `http://localhost:3000`.

## Submission Checklist

- Live app URL is reachable
- Repo URL is public and accessible
- Neon schema exists and demo seed succeeds
- OpenServ agent points at the deployed ingress URL
- Locus key is configured and funded
- Vercel environment variables are set correctly
- Demo path in this README matches the currently working production path

## Post-Submission Cleanup

- Rotate any Neon, Google, OpenServ, and Locus secrets that were exposed during setup
- If you want to keep iterating after submission, stage and push wallet-profile or UI work in a separate commit from the submission README change

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
