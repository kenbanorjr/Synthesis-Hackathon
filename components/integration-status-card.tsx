import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/status-chip";

type HealthSnapshot = {
  execution: {
    liveExecutionEnabled: boolean;
    dryRunByDefault: boolean;
    message: string;
  };
  openserv: {
    ok: boolean;
    message: string;
  };
  locus: {
    ok: boolean;
    message: string;
  };
};

type IntegrationSettingsRecord = {
  openservMode: string;
  locusMode: string;
  managedWalletRef?: string | null;
  openservEndpoint?: string | null;
};

type ReceiptRecord = {
  status: string;
  metadata?: unknown;
};

function countLiveReceipts(receipts: ReceiptRecord[]) {
  return receipts.filter((receipt) => {
    if (!receipt.metadata || typeof receipt.metadata !== "object") {
      return false;
    }

    return (receipt.metadata as Record<string, unknown>).transport === "locus-wrapped-api";
  }).length;
}

export function IntegrationStatusCard({
  health,
  settings,
  receipts
}: {
  health: HealthSnapshot;
  settings: IntegrationSettingsRecord;
  receipts: ReceiptRecord[];
}) {
  const liveReceiptCount = countLiveReceipts(receipts);
  const walletMessage =
    settings.locusMode === "REAL"
      ? settings.managedWalletRef
        ? `Locus managed spend rail ready as ${settings.managedWalletRef}.`
        : "Locus spend rail is keyed by the agent API key and ready for wrapped API calls."
      : "Mock wallet rail is active for demo and local testing.";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration readiness</CardTitle>
        <CardDescription>Judge-facing proof that TreasuryPilot is wired to a real spend rail and a real agent ingress.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div className="rounded-[1.2rem] border border-border/70 bg-muted/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-foreground">OpenServ custom agent</p>
            <StatusChip value={settings.openservMode} />
          </div>
          <p className="mt-2 text-muted-foreground">{health.openserv.message}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Endpoint: {settings.openservEndpoint ?? "Generated from NEXT_PUBLIC_APP_URL after org bootstrap"}
          </p>
        </div>

        <div className="rounded-[1.2rem] border border-border/70 bg-muted/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-foreground">Locus spend rail</p>
            <StatusChip value={settings.locusMode} />
          </div>
          <p className="mt-2 text-muted-foreground">{health.locus.message}</p>
          <p className="mt-2 text-muted-foreground">{walletMessage}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Live wrapped-API receipts captured: {liveReceiptCount}
          </p>
        </div>

        <div className="rounded-[1.2rem] border border-border/70 bg-muted/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-foreground">Execution rail</p>
            <StatusChip value={health.execution.liveExecutionEnabled ? "ACTIVE" : "PAUSED"} />
          </div>
          <p className="mt-2 text-muted-foreground">{health.execution.message}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {health.execution.dryRunByDefault
              ? "Bounded execution stays dry-run-first in this hackathon build."
              : "Dry-run default is disabled for this organization."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
