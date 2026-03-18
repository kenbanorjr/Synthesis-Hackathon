import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PolicyForm } from "@/components/policy-form";

describe("PolicyForm", () => {
  it("submits updated policy values", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {}, error: null })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PolicyForm
        policy={{
          monthlyBudgetUsd: 1500,
          maxSpendPerActionUsd: 500,
          approvalThresholdUsd: 180,
          allowedProviders: ["locus-analytics"],
          allowedActions: ["BUY_ANALYTICS", "SWITCH_STRATEGY"],
          autoExecuteLowRisk: false
        }}
      />
    );

    fireEvent.change(screen.getByLabelText(/Monthly Budget/i), {
      target: { value: "1800" }
    });
    fireEvent.click(screen.getByRole("button", { name: /gauntlet/i }));
    fireEvent.click(screen.getByRole("button", { name: /Save policy/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/policies",
        expect.objectContaining({
          method: "POST"
        })
      );
    });

    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string) as {
      monthlyBudgetUsd: number;
      allowedProviders: string[];
    };

    expect(payload.monthlyBudgetUsd).toBe(1800);
    expect(payload.allowedProviders).toEqual(expect.arrayContaining(["gauntlet"]));
  });

  it("preserves and adds custom providers", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {}, error: null })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PolicyForm
        policy={{
          monthlyBudgetUsd: 1500,
          maxSpendPerActionUsd: 500,
          approvalThresholdUsd: 180,
          allowedProviders: ["custom-alpha"],
          allowedActions: ["BUY_ANALYTICS", "SWITCH_STRATEGY"],
          autoExecuteLowRisk: false
        }}
      />
    );

    expect(screen.getByRole("button", { name: /custom-alpha/i })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Add custom provider/i), {
      target: { value: "vault-guardian" }
    });
    fireEvent.click(screen.getByRole("button", { name: /Add provider/i }));
    fireEvent.click(screen.getByRole("button", { name: /Save policy/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string) as {
      allowedProviders: string[];
    };

    expect(payload.allowedProviders).toEqual(expect.arrayContaining(["custom-alpha", "vault-guardian"]));
  });
});
