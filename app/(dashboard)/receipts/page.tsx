export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/page-header";
import { ReceiptsTable } from "@/components/receipts-table";
import { listReceiptsForOrganization } from "@/lib/services/payment-service";
import { requireCurrentOrganizationContext } from "@/lib/session";

export default async function ReceiptsPage() {
  const workspace = await requireCurrentOrganizationContext();
  const receipts = await listReceiptsForOrganization(workspace.organization.id, 50);

  return (
    <>
      <PageHeader
        title="Receipts and audit log"
        description="Every premium analytics purchase or policy-governed spend is visible here with status, reasoning, and the linked agent run."
      />
      <ReceiptsTable receipts={receipts} />
    </>
  );
}
