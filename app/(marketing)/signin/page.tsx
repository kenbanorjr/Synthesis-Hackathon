import Link from "next/link";
import { SessionButton } from "@/components/session-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { appConfig } from "@/lib/config";

function resolveAuthError(error?: string | string[]) {
  const value = Array.isArray(error) ? error[0] : error;

  switch (value) {
    case "OAuthAccountNotLinked":
      return "This email is already linked to a different sign-in method. Use the original provider for that account.";
    case "OAuthCallback":
    case "OAuthSignin":
      return "Google sign-in failed during the callback flow. Re-check the deployed callback URL and OAuth client settings.";
    case "CredentialsSignin":
      return "Development sign-in failed. Re-check the demo auth configuration and database connectivity.";
    case "Configuration":
      return "Auth is misconfigured for this environment. Verify NEXTAUTH_URL, AUTH_SECRET, and provider credentials.";
    case "AccessDenied":
      return "Access was denied by the authentication provider.";
    case "Verification":
      return "The sign-in session could not be verified. Try again in a new tab.";
    default:
      return value ? `Sign-in failed: ${value}` : null;
  }
}

export default async function SignInPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const googleReady = Boolean(appConfig.auth.googleClientId && appConfig.auth.googleClientSecret);
  const authError = resolveAuthError(params.error);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Optional sign-in</CardTitle>
          <CardDescription>
            TreasuryPilot is open for the hackathon. Use the direct links below, or optionally sign in with Google if you want a production-style auth flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[1.5rem] bg-muted/70 p-5 text-sm text-muted-foreground">
            <p>The live demo no longer requires authentication.</p>
            <p className="mt-2">Use the shared demo workspace to explore the dashboard, run the workflow, and inspect receipts immediately.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/demo">Run demo mode</Link>
            </Button>
          </div>
          {authError ? (
            <div className="rounded-[1.5rem] border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {authError}
            </div>
          ) : null}
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
              Google OAuth is not required for the hackathon flow. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` only if you still want production auth.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
