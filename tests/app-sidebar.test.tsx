import { render, screen } from "@testing-library/react";
import { AppSidebar } from "@/components/app-sidebar";

describe("AppSidebar", () => {
  it("shows the run count badge in navigation", () => {
    render(
      <AppSidebar
        organizationName="TreasuryPilot Demo Workspace"
        userLabel="demo@example.com"
        badgeCounts={{ "/runs": 3 }}
      />
    );

    expect(screen.getByText("Agent Runs")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
