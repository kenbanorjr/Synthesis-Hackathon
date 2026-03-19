import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusChip } from "@/components/status-chip";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

function getReceiptMetadata(metadata: unknown) {
  return metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : null;
}

export function ReceiptsTable({
  receipts,
  totalSpentUsd,
  emptyMessage = "No receipts match the current filters."
}: {
  receipts: Array<{
    id: string;
    provider: string;
    purpose: string;
    amountUsd: number;
    status: string;
    externalTxId?: string | null;
    reason: string;
    metadata?: unknown;
    createdAt: string;
    run?: {
      triggerSummary: string;
      strategyName: string;
    };
  }>;
  totalSpentUsd?: number;
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-white/70">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Linked Run</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Transaction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : null}
          {receipts.map((receipt) => (
            <TableRow key={receipt.id}>
              <TableCell className="font-medium">
                <p>{receipt.provider}</p>
                {typeof getReceiptMetadata(receipt.metadata)?.endpoint === "string" ? (
                  <p className="text-xs text-muted-foreground">
                    /{String(getReceiptMetadata(receipt.metadata)?.endpoint)}
                  </p>
                ) : null}
              </TableCell>
              <TableCell>
                <p>{receipt.purpose}</p>
                <p className="text-xs text-muted-foreground">{receipt.reason}</p>
                {typeof getReceiptMetadata(receipt.metadata)?.approvalUrl === "string" ? (
                  <a
                    href={String(getReceiptMetadata(receipt.metadata)?.approvalUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex text-xs font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Open approval in Locus
                  </a>
                ) : null}
              </TableCell>
              <TableCell>{formatCurrency(receipt.amountUsd)}</TableCell>
              <TableCell>
                <StatusChip value={receipt.status} />
              </TableCell>
              <TableCell>
                {receipt.run ? (
                  <>
                    <p className="font-medium">{receipt.run.strategyName}</p>
                    <p className="text-xs text-muted-foreground">{receipt.run.triggerSummary}</p>
                  </>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>{formatDateTime(receipt.createdAt)}</TableCell>
              <TableCell>
                {receipt.externalTxId ? (
                  <span
                    title={receipt.externalTxId}
                    className="block max-w-[11rem] truncate text-xs font-medium text-primary md:max-w-[14rem]"
                  >
                    {receipt.externalTxId}
                  </span>
                ) : typeof getReceiptMetadata(receipt.metadata)?.approvalUrl === "string" ? (
                  <a
                    href={String(getReceiptMetadata(receipt.metadata)?.approvalUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="block max-w-[11rem] truncate text-xs font-medium text-primary underline-offset-4 hover:underline md:max-w-[14rem]"
                    title={String(getReceiptMetadata(receipt.metadata)?.approvalUrl)}
                  >
                    Locus approval
                  </a>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {typeof totalSpentUsd === "number" ? (
          <tfoot>
            <tr className="border-t border-border/70 bg-muted/50">
              <td colSpan={6} className="p-3 text-sm font-semibold text-foreground">
                Total spent (completed)
              </td>
              <td className="p-3 text-sm font-semibold text-foreground">{formatCurrency(totalSpentUsd)}</td>
            </tr>
          </tfoot>
        ) : null}
      </Table>
    </div>
  );
}
