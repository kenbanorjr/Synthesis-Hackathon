import { prisma } from "@/lib/db";

export async function getOrganizationWallet(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      walletAddress: true
    }
  });

  if (!organization) {
    throw new Error("Organization not found.");
  }

  return {
    id: organization.id,
    walletAddress: organization.walletAddress
  };
}

export async function upsertOrganizationWallet(organizationId: string, input: { walletAddress: string | null }) {
  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      walletAddress: input.walletAddress
    },
    select: {
      id: true,
      walletAddress: true
    }
  });

  return {
    id: organization.id,
    walletAddress: organization.walletAddress
  };
}
