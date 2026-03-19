import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrategyStatus } from "@prisma/client";
import { toast } from "sonner";
import { StrategyForm } from "@/components/strategy-form";

describe("StrategyForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks submission when metadata JSON is invalid", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {}, error: null })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<StrategyForm />);

    fireEvent.change(screen.getByLabelText(/Metadata JSON/i), {
      target: { value: "{\"positionUsd\":" }
    });
    fireEvent.click(screen.getByRole("button", { name: /Create strategy/i }));

    await waitFor(() => {
      expect(screen.getByText(/Unexpected end of JSON input|Metadata must be valid JSON|Metadata must be a JSON object/i)).toBeInTheDocument();
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits a saved strategy and shows success feedback", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: "c123456789012345678901234",
          name: "Treasury Ladder",
          protocol: "Morpho",
          network: "Base",
          assetSymbol: "USDC",
          currentYield: 5.2,
          targetYield: 6.1,
          riskScore: 32,
          status: StrategyStatus.ACTIVE,
          metadata: { positionUsd: 125000 }
        },
        error: null
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <StrategyForm
        mode="edit"
        strategy={{
          id: "c123456789012345678901234",
          name: "Treasury Ladder",
          protocol: "Morpho",
          network: "Base",
          assetSymbol: "USDC",
          currentYield: 5.2,
          targetYield: 6.1,
          riskScore: 32,
          status: StrategyStatus.ACTIVE,
          metadata: { positionUsd: 125000 }
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string) as {
      id?: string;
    };

    expect(payload.id).toBe("c123456789012345678901234");
    expect(toast.success).toHaveBeenCalledWith("Strategy updated.", { duration: 2500 });
  });
});
