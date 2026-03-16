import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DemoActions } from "@/components/demo-actions";

describe("DemoActions", () => {
  it("calls the demo run endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {}, error: null })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<DemoActions />);
    fireEvent.click(screen.getByRole("button", { name: /Run full workflow/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/demo/run",
        expect.objectContaining({
          method: "POST"
        })
      );
    });
  });
});
