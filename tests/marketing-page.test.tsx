import { render, screen } from "@testing-library/react";
import { getOptionalCurrentUser } from "@/lib/session";
import MarketingPage from "@/app/(marketing)/page";

vi.mock("@/lib/session", () => ({
  getOptionalCurrentUser: vi.fn()
}));

describe("MarketingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders auth-aware CTA links for signed-out visitors", async () => {
    vi.mocked(getOptionalCurrentUser).mockResolvedValue(null);

    render(await MarketingPage());

    expect(screen.getByRole("link", { name: /Open dashboard/i })).toHaveAttribute(
      "href",
      "/signin?callbackUrl=%2Fdashboard"
    );
    expect(screen.getByRole("link", { name: /Run demo mode/i })).toHaveAttribute(
      "href",
      "/signin?callbackUrl=%2Fdemo"
    );
  });

  it("routes signed-in users directly into the app", async () => {
    vi.mocked(getOptionalCurrentUser).mockResolvedValue({
      id: "user_123",
      email: "demo@example.com",
      name: "Demo User"
    } as never);

    render(await MarketingPage());

    expect(screen.getByRole("link", { name: /Open dashboard/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /Run demo mode/i })).toHaveAttribute("href", "/demo");
  });
});
