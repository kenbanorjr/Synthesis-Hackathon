# TreasuryPilot Hackathon Alignment Review

Review date: 2026-03-18

## Verdict

TreasuryPilot is conceptually aligned with the OpenServ and Locus hackathon expectations, but it is not yet operationally submission-ready.

## What Aligns Well

- The product shape matches the brief: a budget-aware treasury assistant with monitored strategies, policy controls, receipts, approvals, and an audit trail.
- The multi-agent workflow is clearly modeled with distinct `Monitor`, `Research`, `Risk`, `Execution`, and `Explainer` roles.
- The data model supports end-to-end traceability through `AgentRun`, `AgentStep`, `PaymentReceipt`, `Recommendation`, and `ApprovalRequest`.
- The operator UI covers the expected demo surfaces: dashboard, runs, receipts, strategies, policies, and demo actions.
- A seeded demo path exists through the demo seed and demo run routes.

## Alignment Gaps

### Operational Health

- `npm test` currently fails.
- `npm run check` currently fails.
- The repository therefore does not currently meet the reliability bar for a strong hackathon submission.

### Prisma / Reproducibility

- The project currently installs `latest` Prisma packages, and the active CLI is Prisma 7.
- The schema still uses the older datasource `url = env("DATABASE_URL")` configuration path, which Prisma 7 rejects during `prisma validate`.
- The failing test suites also show that Prisma client generation and Prisma mocking are not in a stable working state.

### Integration Reality Gap

- The `real` OpenServ adapter is a shim contract, not a direct standard OpenServ integration. It expects a custom service exposing `/health` and `/workflows/treasury-pilot`.
- The `real` Locus adapter is also shaped as a compatible REST shim and should not be treated as verified against the live platform until it is tested with real credentials and endpoints.

## Current Health Snapshot

### `npm test`

- Fails because several suites cannot resolve the generated Prisma client.
- The demo seed API route test also has a broken `PrismaClient` mock shape.

### `npm run check`

- Fails during `prisma validate` because the current Prisma CLI/schema setup is incompatible.

## Conclusion

TreasuryPilot already tells a credible hackathon story:

- meaningful multi-agent workflow
- budget-aware spend controls
- approval-gated payments
- visible receipts and audit trail
- seeded demo flow

The main blocker is not product direction. It is repo health and reproducibility. Until Prisma configuration, generated client flow, and the failing tests are fixed, the project is better described as a strong demo-oriented MVP than a fully submission-ready build.
