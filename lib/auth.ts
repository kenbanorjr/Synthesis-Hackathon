import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { appConfig } from "@/lib/config";
import { prisma } from "@/lib/db";
import { ensureUserOrganization } from "@/lib/services/organization-service";

const providers = [];

if (appConfig.auth.googleClientId && appConfig.auth.googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: appConfig.auth.googleClientId,
      clientSecret: appConfig.auth.googleClientSecret
    })
  );
}

if (appConfig.auth.allowDemoAuth) {
  providers.push(
    CredentialsProvider({
      name: "Demo workspace",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: appConfig.demoUserEmail
        }
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase() || appConfig.demoUserEmail;
        const user = await prisma.user.upsert({
          where: { email },
          update: {
            name: "TreasuryPilot Demo Operator"
          },
          create: {
            email,
            name: "TreasuryPilot Demo Operator"
          }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        };
      }
    })
  );
}

if (providers.length === 0) {
  providers.push(
    CredentialsProvider({
      id: "disabled",
      name: "Unavailable",
      credentials: {},
      async authorize() {
        return null;
      }
    })
  );
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  secret: appConfig.auth.secret,
  session: {
    strategy: "jwt" as const
  },
  providers,
  pages: {
    signIn: "/signin"
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user?.id) {
        token.userId = user.id;
      }

      return token;
    },
    async session({ session, token }: any) {
      const userId = token.userId ?? token.sub;

      if (!userId || !session.user) {
        return session;
      }

      const workspace = await ensureUserOrganization(userId);

      session.user.id = userId;
      session.user.organizationId = workspace.organization.id;
      session.user.organizationName = workspace.organization.name;
      session.user.membershipRole = workspace.membership.role;

      return session;
    }
  }
};

export async function getServerAuthSession(): Promise<{ user?: AppSessionUser } | null> {
  return getServerSession(authOptions) as Promise<{ user?: AppSessionUser } | null>;
}

export type AppSessionUser = {
  id: string;
  organizationId: string;
  organizationName: string;
  membershipRole: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};
