"use client";

import { LogIn, LogOut } from "lucide-react";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SessionButton({
  action,
  callbackUrl = "/dashboard",
  variant = "default",
  provider,
  label,
  signInOptions
}: {
  action: "signIn" | "signOut";
  callbackUrl?: string;
  variant?: "default" | "secondary" | "outline";
  provider?: string;
  label?: string;
  signInOptions?: Record<string, string>;
}) {
  if (action === "signIn") {
    return (
      <Button
        variant={variant}
        onClick={() => {
          void signIn(provider, { callbackUrl, ...signInOptions });
        }}
      >
        <LogIn className="h-4 w-4" />
        {label ?? "Sign in"}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={() => {
        void signOut({ callbackUrl: "/" });
      }}
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}
