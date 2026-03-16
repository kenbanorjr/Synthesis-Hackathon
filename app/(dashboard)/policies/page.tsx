export const dynamic = "force-dynamic";

import { BudgetUsageCard } from "@/components/budget-usage-card";
import { PageHeader } from "@/components/page-header";
import { PolicyForm } from "@/components/policy-form";
import { getDashboardData } from "@/lib/services/dashboard-service";
import { getDemoUserWithWorkspace } from "@/lib/services/user-service";

export default async function PoliciesPage() {
  const workspace = await getDemoUserWithWorkspace();
  const dashboard = await getDashboardData(workspace.id);

  return (
    <>
      <PageHeader
        title="Treasury policy"
        description="Tune budget boundaries, action permissions, and low-risk automation rules before you let TreasuryPilot spend or act."
      />
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <PolicyForm policy={dashboard.policy as never} />
        <BudgetUsageCard budget={dashboard.budget} />
      </section>
    </>
  );
}
