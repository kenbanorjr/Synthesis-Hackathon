import { render, screen } from "@testing-library/react";
import MarketingPage from "@/app/(marketing)/page";

describe("MarketingPage", () => {
  it("routes visitors directly into the dashboard and demo", async () => {
    render(await MarketingPage());

    expect(screen.getByRole("link", { name: /Open dashboard/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /Run demo mode/i })).toHaveAttribute("href", "/demo");
  });
});
