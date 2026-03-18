import {
  IntegrationMode,
  MembershipRole,
  Prisma,
  type ExecutionSettings,
  type IntegrationSettings,
  type Membership,
  type Organization,
  type TreasuryPolicy,
  type User
} from "@prisma/client";
import { appConfig } from "@/lib/config";
import { defaultAllowedActions, defaultAllowedProviders } from "@/lib/constants";
import { prisma } from "@/lib/db";

interface OrganizationContext {
  user: User;
  membership: Membership;
  organization: Organization;
  policy: TreasuryPolicy;
  integrationSettings: IntegrationSettings;
  executionSettings: ExecutionSettings;
}

function slugifyOrganizationName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48) || "treasury-team";
}

async function createUniqueSlug(base: string) {
  const normalized = slugifyOrganizationName(base);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const slug = attempt === 0 ? normalized : `${normalized}-${attempt + 1}`;
    const existing = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!existing) {
      return slug;
    }
  }

  throw new Error("Failed to allocate a unique organization slug.");
}

async function ensureOrganizationDefaults(input: {
  organizationId: string;
  openservMode?: IntegrationMode;
  locusMode?: IntegrationMode;
  demoMode?: boolean;
}) {
  const policy = await prisma.treasuryPolicy.upsert({
    where: { organizationId: input.organizationId },
    update: {},
    create: {
      organizationId: input.organizationId,
      monthlyBudgetUsd: new Prisma.Decimal(1500),
      maxSpendPerActionUsd: new Prisma.Decimal(500),
      approvalThresholdUsd: new Prisma.Decimal(180),
      allowedProviders: [...defaultAllowedProviders],
      allowedActions: [...defaultAllowedActions],
      autoExecuteLowRisk: false
    }
  });

  const integrationSettings = await prisma.integrationSettings.upsert({
    where: { organizationId: input.organizationId },
    update: {},
    create: {
      organizationId: input.organizationId,
      openservMode: input.openservMode ?? appConfig.openservMode,
      locusMode: input.locusMode ?? appConfig.locusMode,
      demoMode: input.demoMode ?? process.env.NODE_ENV !== "production",
      openservEndpoint: `${appConfig.appUrl}${appConfig.openservIngressPath}`
    }
  });

  const executionSettings = await prisma.executionSettings.upsert({
    where: { organizationId: input.organizationId },
    update: {},
    create: {
      organizationId: input.organizationId,
      liveExecutionEnabled: false,
      dryRunByDefault: true,
      emergencyStop: false,
      allowedChains: ["base"],
      allowedDestinations: [],
      allowedExecutionProviders: ["locus-transfer", "base-usdc"],
      maxExecutionSizeUsd: new Prisma.Decimal(1000)
    }
  });

  return {
    policy,
    integrationSettings,
    executionSettings
  };
}

async function createDefaultOrganizationForUser(user: User) {
  const baseName = user.name?.trim() ? `${user.name.trim()}'s Treasury` : "TreasuryPilot Workspace";
  const slug = await createUniqueSlug(baseName);

  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: baseName,
        slug,
        createdByUserId: user.id
      }
    });

    const membership = await tx.membership.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: MembershipRole.OWNER
      }
    });

    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        defaultOrganizationId: organization.id
      }
    });

    return {
      organization,
      membership,
      user: updatedUser
    };
  });
}

export async function ensureUserOrganization(userId: string): Promise<OrganizationContext> {
  let user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!user) {
    throw new Error("Authenticated user not found.");
  }

  if (user.memberships.length === 0) {
    const created = await createDefaultOrganizationForUser(user);
    user = {
      ...created.user,
      memberships: [created.membership]
    } as typeof user;
  }

  const organizationId = user.defaultOrganizationId ?? user.memberships[0]?.organizationId;

  if (!organizationId) {
    throw new Error("No organization is available for the authenticated user.");
  }

  if (user.defaultOrganizationId !== organizationId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        defaultOrganizationId: organizationId
      },
      include: {
        memberships: {
          orderBy: { createdAt: "asc" }
        }
      }
    });
  }

  const membership = await prisma.membership.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: user.id
      }
    }
  });

  if (!membership) {
    throw new Error("Membership for the default organization could not be found.");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId }
  });

  if (!organization) {
    throw new Error("Default organization not found.");
  }

  const { policy, integrationSettings, executionSettings } = await ensureOrganizationDefaults({
    organizationId
  });

  return {
    user,
    membership,
    organization,
    policy,
    integrationSettings,
    executionSettings
  };
}
