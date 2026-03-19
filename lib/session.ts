import { getServerAuthSession } from "@/lib/auth";
import { ensureDemoOrganizationContext, ensureUserOrganization } from "@/lib/services/organization-service";

export async function getOptionalCurrentUser() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return null;
  }

  return session.user;
}

export async function getOptionalCurrentOrganizationContext() {
  const user = await getOptionalCurrentUser();

  if (user?.id) {
    return ensureUserOrganization(user.id);
  }

  return ensureDemoOrganizationContext();
}

export async function requireCurrentOrganizationContext() {
  return getOptionalCurrentOrganizationContext();
}

export async function requireApiOrganizationContext() {
  return getOptionalCurrentOrganizationContext();
}
