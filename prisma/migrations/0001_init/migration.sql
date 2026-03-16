-- CreateEnum
CREATE TYPE "StrategyStatus" AS ENUM ('ACTIVE', 'PAUSED', 'WATCHLIST', 'AT_RISK');
CREATE TYPE "TriggerType" AS ENUM ('YIELD_DROP', 'RISK_INCREASE', 'BETTER_OPPORTUNITY', 'MANUAL_REVIEW');
CREATE TYPE "RunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'AWAITING_APPROVAL', 'BLOCKED', 'FAILED');
CREATE TYPE "AgentType" AS ENUM ('MONITOR', 'RESEARCH', 'RISK', 'EXECUTION', 'EXPLAINER');
CREATE TYPE "StepStatus" AS ENUM ('SUCCESS', 'FAILED', 'SKIPPED', 'PENDING');
CREATE TYPE "ReceiptStatus" AS ENUM ('COMPLETED', 'PENDING_APPROVAL', 'REJECTED', 'FAILED');
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "ActionType" AS ENUM ('BUY_ANALYTICS', 'REBALANCE', 'SWITCH_STRATEGY', 'HEDGE_POSITION');
CREATE TYPE "IntegrationMode" AS ENUM ('MOCK', 'REAL');
CREATE TYPE "DecisionOutcome" AS ENUM ('RECOMMENDED', 'AWAITING_APPROVAL', 'EXECUTED', 'BLOCKED', 'NO_ACTION', 'REJECTED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "walletAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TreasuryPolicy" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "monthlyBudgetUsd" DECIMAL(12,2) NOT NULL,
  "maxSpendPerActionUsd" DECIMAL(12,2) NOT NULL,
  "approvalThresholdUsd" DECIMAL(12,2) NOT NULL,
  "allowedProviders" TEXT[] NOT NULL,
  "allowedActions" "ActionType"[] NOT NULL,
  "autoExecuteLowRisk" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TreasuryPolicy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MonitoredStrategy" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "protocol" TEXT NOT NULL,
  "network" TEXT NOT NULL,
  "assetSymbol" TEXT NOT NULL,
  "currentYield" DECIMAL(8,2) NOT NULL,
  "targetYield" DECIMAL(8,2) NOT NULL,
  "riskScore" DECIMAL(5,2) NOT NULL,
  "status" "StrategyStatus" NOT NULL DEFAULT 'ACTIVE',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MonitoredStrategy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentRun" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "strategyId" TEXT NOT NULL,
  "triggerType" "TriggerType" NOT NULL,
  "triggerSummary" TEXT NOT NULL,
  "status" "RunStatus" NOT NULL,
  "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
  "finalDecision" "DecisionOutcome" NOT NULL,
  "confidenceScore" DECIMAL(5,2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentStep" (
  "id" TEXT NOT NULL,
  "agentRunId" TEXT NOT NULL,
  "agentType" "AgentType" NOT NULL,
  "title" TEXT NOT NULL,
  "input" JSONB,
  "output" JSONB,
  "status" "StepStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgentStep_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentReceipt" (
  "id" TEXT NOT NULL,
  "agentRunId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "amountUsd" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "status" "ReceiptStatus" NOT NULL,
  "externalTxId" TEXT,
  "reason" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentReceipt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Recommendation" (
  "id" TEXT NOT NULL,
  "agentRunId" TEXT NOT NULL,
  "headline" TEXT NOT NULL,
  "rationale" TEXT NOT NULL,
  "proposedAction" TEXT NOT NULL,
  "expectedImpact" TEXT NOT NULL,
  "riskAssessment" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApprovalRequest" (
  "id" TEXT NOT NULL,
  "agentRunId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntegrationSettings" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "openservMode" "IntegrationMode" NOT NULL DEFAULT 'MOCK',
  "locusMode" "IntegrationMode" NOT NULL DEFAULT 'MOCK',
  "demoMode" BOOLEAN NOT NULL DEFAULT true,
  "managedWalletRef" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IntegrationSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "TreasuryPolicy_userId_key" ON "TreasuryPolicy"("userId");
CREATE UNIQUE INDEX "MonitoredStrategy_userId_name_key" ON "MonitoredStrategy"("userId", "name");
CREATE UNIQUE INDEX "Recommendation_agentRunId_key" ON "Recommendation"("agentRunId");
CREATE UNIQUE INDEX "ApprovalRequest_agentRunId_key" ON "ApprovalRequest"("agentRunId");
CREATE UNIQUE INDEX "IntegrationSettings_userId_key" ON "IntegrationSettings"("userId");

ALTER TABLE "TreasuryPolicy"
ADD CONSTRAINT "TreasuryPolicy_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MonitoredStrategy"
ADD CONSTRAINT "MonitoredStrategy_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AgentRun"
ADD CONSTRAINT "AgentRun_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AgentRun"
ADD CONSTRAINT "AgentRun_strategyId_fkey"
FOREIGN KEY ("strategyId") REFERENCES "MonitoredStrategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AgentStep"
ADD CONSTRAINT "AgentStep_agentRunId_fkey"
FOREIGN KEY ("agentRunId") REFERENCES "AgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PaymentReceipt"
ADD CONSTRAINT "PaymentReceipt_agentRunId_fkey"
FOREIGN KEY ("agentRunId") REFERENCES "AgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Recommendation"
ADD CONSTRAINT "Recommendation_agentRunId_fkey"
FOREIGN KEY ("agentRunId") REFERENCES "AgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ApprovalRequest"
ADD CONSTRAINT "ApprovalRequest_agentRunId_fkey"
FOREIGN KEY ("agentRunId") REFERENCES "AgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "IntegrationSettings"
ADD CONSTRAINT "IntegrationSettings_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
