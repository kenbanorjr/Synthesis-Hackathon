import { render, screen } from "@testing-library/react";
import DashboardLoading from "@/app/(dashboard)/loading";

describe("DashboardLoading", () => {
  it("renders the editorial cockpit loading skeleton immediately", () => {
    render(<DashboardLoading />);

    expect(screen.getByTestId("dashboard-loading")).toBeInTheDocument();
  });
});
