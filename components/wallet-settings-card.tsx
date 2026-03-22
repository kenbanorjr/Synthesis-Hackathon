"use client";

import { startTransition, useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WalletSettingsCard({ walletAddress }: { walletAddress?: string | null }) {
  const router = useRouter();
  const [draft, setDraft] = useState(walletAddress ?? "");
  const [isPending, setIsPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    walletAddress
      ? "Customer treasury wallet profile is saved. Premium research spend still uses the Locus-managed rail in this build."
      : "No customer treasury wallet is saved yet. TreasuryPilot will continue using the Locus-managed rail messaging."
  );

  useEffect(() => {
    setDraft(walletAddress ?? "");
    setStatusMessage(
      walletAddress
        ? "Customer treasury wallet profile is saved. Premium research spend still uses the Locus-managed rail in this build."
        : "No customer treasury wallet is saved yet. TreasuryPilot will continue using the Locus-managed rail messaging."
    );
  }, [walletAddress]);

  function persist(nextWalletAddress: string | null) {
    setIsPending(true);
    setStatusMessage(
      nextWalletAddress
        ? "Saving customer treasury wallet profile."
        : "Clearing customer treasury wallet profile and falling back to the Locus-managed rail."
    );

    startTransition(async () => {
      const response = await fetch("/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          walletAddress: nextWalletAddress
        })
      });

      const payload = (await response.json()) as { error: { message: string } | null };

      if (!response.ok) {
        const message = payload.error?.message ?? "Failed to save wallet settings.";
        toast.error(message);
        setStatusMessage(message);
        setIsPending(false);
        return;
      }

      toast.success(nextWalletAddress ? "Wallet saved." : "Wallet cleared.", { duration: 2500 });
      setStatusMessage(
        nextWalletAddress
          ? "Customer treasury wallet profile saved. Premium research spend still uses the current Locus-managed rail."
          : "Customer treasury wallet profile cleared. Locus-managed rail messaging is active again."
      );
      router.refresh();
      setIsPending(false);
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyan-200">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <CardTitle>Customer wallet profile</CardTitle>
            <CardDescription>
              Save the org treasury wallet address for identity and destination visibility. This does not replace the current Locus-managed spend rail.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div
          aria-live="polite"
          className="rounded-[1.35rem] border border-cyan-300/20 bg-slate-950 px-4 py-4 text-sm text-slate-100"
        >
          <p className="eyebrow text-cyan-200">Wallet rail status</p>
          <p className="mt-2">{statusMessage}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-wallet-address">Treasury wallet address</Label>
          <Input
            id="customer-wallet-address"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="0xYourTreasuryWallet"
          />
          <p className="text-sm text-muted-foreground">
            Leave this blank to keep the org on the default Locus-managed rail messaging.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isPending || (!walletAddress && draft.trim().length === 0)}
            onClick={() => {
              setDraft("");
              persist(null);
            }}
          >
            {isPending && draft.trim().length === 0 ? "Clearing..." : "Clear wallet"}
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => {
              persist(draft.trim() === "" ? null : draft.trim());
            }}
          >
            {isPending && draft.trim().length > 0 ? "Saving..." : "Save wallet"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
