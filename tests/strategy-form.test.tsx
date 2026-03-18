import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrategyForm } from "@/components/strategy-form";

describe("StrategyForm", () => {
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
    fireEvent.click(screen.getByRole("button", { name: /Save strategy/i }));

    await waitFor(() => {
      expect(screen.getByText(/Unexpected end of JSON input|Metadata must be valid JSON|Metadata must be a JSON object/i)).toBeInTheDocument();
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
