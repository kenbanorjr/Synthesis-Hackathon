import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DemoActions } from "@/components/demo-actions";

describe("DemoActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("calls the demo reset endpoint and shows the ready callout", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {}, error: null })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<DemoActions />);
    fireEvent.click(screen.getByRole("button", { name: /Reset to clean state/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/demo/reset",
        expect.objectContaining({
          method: "POST"
        })
      );
    });

    expect(screen.getByText(/Demo workspace ready/i)).toBeInTheDocument();
  });

  it("prevents duplicate workflow submissions while a run is in flight", async () => {
    let resolveRequest:
      | ((value: { ok: boolean; json: () => Promise<{ data: {}; error: null }> }) => void)
      | undefined;
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<DemoActions />);
    const runButton = screen.getByRole("button", { name: /Run full workflow/i });

    fireEvent.click(runButton);
    fireEvent.click(runButton);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveRequest?.({
      ok: true,
      json: async () => ({ data: {}, error: null })
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Run full workflow/i })).toBeEnabled();
    });
  });
});
