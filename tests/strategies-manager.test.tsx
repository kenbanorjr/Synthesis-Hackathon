import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrategyStatus } from "@prisma/client";
import { StrategiesManager } from "@/components/strategies-manager";

const strategies = [
  {
    id: "c123456789012345678901234",
    name: "USDC Yield Vault",
    protocol: "Spark",
    network: "Base",
    assetSymbol: "USDC",
    currentYield: 4.1,
    targetYield: 6.2,
    riskScore: 37,
    status: StrategyStatus.ACTIVE,
    metadata: {
      positionUsd: 250000
    }
  },
  {
    id: "c123456789012345678901235",
    name: "Treasury Ladder",
    protocol: "Morpho",
    network: "Base",
    assetSymbol: "USDC",
    currentYield: 5.2,
    targetYield: 6.4,
    riskScore: 31,
    status: StrategyStatus.WATCHLIST,
    metadata: {
      positionUsd: 150000
    }
  }
];

describe("StrategiesManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears the form for a fresh strategy when add strategy is clicked", async () => {
    render(<StrategiesManager strategies={strategies} />);

    expect(screen.getByLabelText(/Strategy name/i)).toHaveValue("USDC Yield Vault");

    fireEvent.click(screen.getByRole("button", { name: /Add strategy/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Strategy name/i)).toHaveValue("");
    });
  });

  it("loads an existing strategy into the form when its card is selected", async () => {
    render(<StrategiesManager strategies={strategies} />);

    fireEvent.click(screen.getByRole("button", { name: /Treasury Ladder/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Strategy name/i)).toHaveValue("Treasury Ladder");
    });
  });
});
