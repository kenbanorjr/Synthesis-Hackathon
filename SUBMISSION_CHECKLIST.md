# TreasuryPilot Submission Checklist

Use this as the single source of truth before submitting TreasuryPilot to Synthesis.

## Required Status

- [x] Real participant agent registered with Synthesis
- [ ] Joined the official Telegram: `https://nsb.dev/synthesis-updates`
- [x] Agent made meaningful code and coordination contributions
- [x] Working demo path exists locally
- [ ] Public GitHub repo is up to date
- [ ] Deployed app URL is live
- [ ] Human-agent collaboration log is prepared
- [ ] On-chain artifacts are collected and linked where possible

## Local Demo Proof

The current repo supports this end-to-end flow:

1. Sign in through `/signin`
2. Open `/demo`
3. Click `Seed demo workspace`
4. Click `Run full workflow`
5. Inspect `/dashboard`
6. Inspect `/runs`
7. Inspect `/receipts`

## Submission Assets

Prepare these before submission:

- GitHub repository URL
- Deployed app URL
- 2-minute demo video URL
- 3-5 screenshots
- Short project summary
- Track justification:
  - `Agents that pay`
  - OpenServ multi-agent workflow
  - Locus spend controls, approvals, and receipts
- Collaboration log
- On-chain links:
  - Synthesis registration transaction
  - Any Base transactions or related artifacts created during the hackathon

## Human-Agent Collaboration Log

Use [CONVERSATION_LOG_TEMPLATE.md](./CONVERSATION_LOG_TEMPLATE.md) and convert the final result into the `conversationLog` field when you submit.

Include:

- initial problem framing
- product decisions
- architecture and tradeoff decisions
- build iterations and fixes
- demo preparation
- submission preparation

## Open Source Requirement

Before the deadline:

- make sure the GitHub repo is public
- keep secrets out of git
- ensure `.env` is not committed
- push the latest working code, README, and setup docs

## On-Chain Artifact Targets

Minimum:

- Synthesis registration identity / transaction link

Stronger submission:

- Base transaction links for any real treasury execution or payment flow
- Locus-backed payment or receipt references if you enable live mode
- Any additional attestations or on-chain actions directly related to the project

## Final Manual Checks

- [ ] `npm run check` passes on the final branch
- [ ] `npm test` passes on the final branch
- [ ] `npm run build` passes on the final branch
- [ ] README reflects the final deployed/demo state truthfully
- [ ] Google OAuth works on the deployed domain
- [ ] Vercel env vars are set
- [ ] Neon `DATABASE_URL` is set in Vercel
- [ ] OpenServ ingress URL is registered
- [ ] Locus beta key is stored if obtained
- [ ] Demo video is recorded
