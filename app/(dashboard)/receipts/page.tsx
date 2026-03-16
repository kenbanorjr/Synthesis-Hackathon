export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/page-header";
import { ReceiptsTable } from "@/components/receipts-table";
import { getDemoUserWithWorkspace } from "@/lib/services/user-service";
import { listReceiptsForUser } from "@/lib/services/payment-service";

export default async function ReceiptsPage() {
  const workspace = await getDemoUserWithWorkspace();
  const receipts = await listReceiptsForUser(workspace.id, 50);

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
