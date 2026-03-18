import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { ensureUserOrganization } from "@/lib/services/organization-service";

export async function getOptionalCurrentUser() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return null;
  }

  return session.user;
}

export async function getOptionalCurrentOrganizationContext() {
  const user = await getOptionalCurrentUser();

  if (!user?.id) {
    return null;
  }

  return ensureUserOrganization(user.id);
}

export async function requireCurrentOrganizationContext() {
  const workspace = await getOptionalCurrentOrganizationContext();

  if (!workspace) {
    redirect("/signin");
  }

  return workspace;
}

export async function requireApiOrganizationContext() {
  const workspace = await getOptionalCurrentOrganizationContext();

  if (!workspace) {
    throw new Error("Unauthorized");
  }

  return workspace;
}
