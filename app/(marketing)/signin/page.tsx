import { redirect } from "next/navigation";
import { SessionButton } from "@/components/session-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { appConfig } from "@/lib/config";
import { getOptionalCurrentOrganizationContext } from "@/lib/session";

export default async function SignInPage() {
  const workspace = await getOptionalCurrentOrganizationContext();

  if (workspace) {
    redirect("/dashboard");
  }

  const googleReady = Boolean(appConfig.auth.googleClientId && appConfig.auth.googleClientSecret);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Sign in to TreasuryPilot</CardTitle>
          <CardDescription>
            Use Google OAuth for production-style access. In local development, you can also use the built-in demo workspace sign-in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[1.5rem] bg-muted/70 p-5 text-sm text-muted-foreground">
            <p>Workspace access is organization-scoped.</p>
            <p className="mt-2">The first successful sign-in automatically creates a default treasury workspace with policy, integration, and execution settings.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {googleReady ? <SessionButton action="signIn" provider="google" callbackUrl="/dashboard" label="Sign in with Google" /> : null}
            {appConfig.auth.allowDemoAuth ? (
              <SessionButton
                action="signIn"
                provider="credentials"
                callbackUrl="/dashboard"
                label="Use development sign-in"
                variant={googleReady ? "outline" : "default"}
                signInOptions={{ email: appConfig.demoUserEmail }}
              />
            ) : null}
          </div>
          {!googleReady ? (
            <p className="text-sm text-muted-foreground">
              Google OAuth is not configured yet. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` for production access.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
