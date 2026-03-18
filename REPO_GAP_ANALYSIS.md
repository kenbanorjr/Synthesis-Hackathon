# TreasuryPilot Repo Gap Analysis

Audit date: 2026-03-17

This audit reviews the current repository against the intended TreasuryPilot hackathon story: OpenServ-powered multi-agent treasury orchestration, Locus-backed spend controls, visible receipts, and a one-click demo flow.

## What Is Already Solid

- The app is already structured as a single Next.js App Router product with a clean service and adapter layer.
- Prisma models for runs, steps, receipts, approvals, recommendations, policies, and strategies already exist and support end-to-end traceability.
- The OpenServ and Locus boundaries are typed and support mock-vs-real mode selection.
- The core workflow already separates Monitor, Research, Risk, Execution, and Explainer responsibilities.
- The seeded workspace and demo routes already provide a strong starting point for a hackathon demo.

## 1. Architecture / Data Model Gaps

- Approval resolution currently compresses multiple outcomes into `EXECUTED`, which weakens audit accuracy when an approval only clears a premium analytics purchase.
- Some important operator actions are not persisted as visible workflow steps after an approval is resolved.
- Policy editing can silently drop custom providers that are present in stored state but not in the default provider list.

## 2. OpenServ Integration Gaps

- The mock orchestration layer is meaningful, but the UI does not surface its outputs as clearly as it could for judges; the raw JSON trace needs better presentation.
- Approval outcomes are not shown as part of the multi-agent narrative, which makes the orchestration story feel incomplete after a gated run.

## 3. Locus Integration Gaps

- Locus-backed approval requests exist in the data model and API, but there is no operator-facing UI to approve or reject them.
- Receipt data exists, but the run detail view does not surface the receipt trail clearly enough to emphasize auditable spend controls.

## 4. Agent Workflow Gaps

- The seeded pending-approval scenario is too thin: it lacks the full step trace and recommendation context needed for a good live demo.
- Approval resolution does not currently add a visible terminal workflow step, so the operator cannot see the gated action close out cleanly.

## 5. UI / UX Polish Gaps

- The runs page shows rationale and step JSON, but it does not expose the approval CTA or a compact receipt trail alongside the run.
- The strategy form can preserve stale metadata if the JSON editor becomes invalid.
- The policy form does not handle custom provider editing well.

## 6. Demo-Readiness Gaps

- The approval path is not currently demoable from the UI, even though the backend supports it.
- The seeded pending-approval run needs richer context so judges can immediately understand why the payment was gated.

## 7. Judging-Criteria Alignment Gaps

- The project already demonstrates multi-agent reasoning and Locus-style spend controls in code, but the UI needs to make approvals, receipts, and budget gates more obvious.
- Reproducibility is still weaker than ideal because dependencies are unpinned and a lockfile is missing; this is important but secondary to the live demo path.

## Priority Fixes For This Pass

1. Add operator approval controls and visible receipt context to the runs experience.
2. Correct approval resolution semantics so the audit trail stays truthful.
3. Strengthen the seeded approval scenario with full workflow context.
4. Harden the policy and strategy forms so demo edits do not silently lose intent.
5. Improve workflow trace readability without changing the core architecture.
