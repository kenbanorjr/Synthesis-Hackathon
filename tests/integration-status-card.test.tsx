import { render, screen } from "@testing-library/react";
import { IntegrationStatusCard } from "@/components/integration-status-card";

const health = {
  execution: {
    liveExecutionEnabled: false,
    dryRunByDefault: true,
    message: "Execution is operating in dry-run mode."
  },
  openserv: {
    ok: true,
    message: "OpenServ endpoint is reachable."
  },
  locus: {
    ok: true,
    message: "Locus wrapped API catalog is reachable."
  }
};

describe("IntegrationStatusCard", () => {
  it("shows the saved customer wallet and Locus-managed fallback messaging", () => {
    render(
      <IntegrationStatusCard
        health={health}
        settings={{
          openservMode: "REAL",
          locusMode: "REAL",
          managedWalletRef: "locus-agent-org_1",
          openservEndpoint: "https://example.com/api/openserv/agent",
          organizationWalletAddress: "0xTreasuryVault"
        }}
        receipts={[]}
      />
    );

    expect(screen.getByText(/Customer treasury wallet saved as 0xTreasuryVault/i)).toBeInTheDocument();
    expect(screen.getByText(/Locus managed spend rail ready as locus-agent-org_1/i)).toBeInTheDocument();
    expect(screen.getByText(/Premium research spend still uses the current Locus-managed rail/i)).toBeInTheDocument();
  });
});
