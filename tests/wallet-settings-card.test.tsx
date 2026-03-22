import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { WalletSettingsCard } from "@/components/wallet-settings-card";

describe("WalletSettingsCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads an existing wallet address into the form", () => {
    render(<WalletSettingsCard walletAddress="0xTreasuryVault" />);

    expect(screen.getByLabelText(/Treasury wallet address/i)).toHaveValue("0xTreasuryVault");
  });

  it("saves a wallet address and shows success feedback", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: "org_1",
          walletAddress: "0xTreasuryVaultNew"
        },
        error: null
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<WalletSettingsCard walletAddress={null} />);

    fireEvent.change(screen.getByLabelText(/Treasury wallet address/i), {
      target: { value: "0xTreasuryVaultNew" }
    });
    fireEvent.click(screen.getByRole("button", { name: /Save wallet/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/wallet",
        expect.objectContaining({
          method: "POST"
        })
      );
    });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toEqual({
      walletAddress: "0xTreasuryVaultNew"
    });
    expect(toast.success).toHaveBeenCalledWith("Wallet saved.", { duration: 2500 });
  });
});
