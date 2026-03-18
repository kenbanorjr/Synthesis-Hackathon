import type { MembershipRole } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organizationId: string;
      organizationName: string;
      membershipRole: MembershipRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
