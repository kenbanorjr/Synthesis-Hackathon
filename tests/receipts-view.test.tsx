import { fireEvent, render, screen } from "@testing-library/react";
import { ReceiptsView } from "@/components/receipts-view";

describe("ReceiptsView", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-19T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("filters receipts and updates the completed spend total", () => {
    render(
      <ReceiptsView
        receipts={[
          {
            id: "receipt_1",
            provider: "exa",
            purpose: "Premium research",
            amountUsd: 120,
            status: "COMPLETED",
            externalTxId: "locus-tx-1234567890",
            reason: "Approved",
            createdAt: "2026-03-18T10:00:00.000Z",
            run: {
              strategyName: "USDC Yield Vault",
              triggerSummary: "Yield dropped below target"
            }
          },
          {
            id: "receipt_2",
            provider: "firecrawl",
            purpose: "Risk review",
            amountUsd: 80,
            status: "FAILED",
            externalTxId: "locus-tx-2222222222",
            reason: "Rejected",
            createdAt: "2026-03-17T10:00:00.000Z",
            run: {
              strategyName: "USDC Yield Vault",
              triggerSummary: "Yield dropped below target"
            }
          },
          {
            id: "receipt_3",
            provider: "exa",
            purpose: "Old research",
            amountUsd: 90,
            status: "COMPLETED",
            externalTxId: "locus-tx-3333333333",
            reason: "Approved",
            createdAt: "2026-01-01T10:00:00.000Z",
            run: {
              strategyName: "Treasury Ladder",
              triggerSummary: "Better opportunity detected"
            }
          }
        ]}
      />
    );

    expect(screen.getByText(/Total spent \$210/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Receipt status filter/i), {
      target: { value: "COMPLETED" }
    });
    fireEvent.change(screen.getByLabelText(/Receipt date filter/i), {
      target: { value: "LAST_7_DAYS" }
    });

    expect(screen.getByText(/Total spent \$120/i)).toBeInTheDocument();
    expect(screen.getByText("Premium research")).toBeInTheDocument();
    expect(screen.queryByText("Old research")).not.toBeInTheDocument();
  });
});
