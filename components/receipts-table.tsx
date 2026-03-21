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
    <div className="paper-panel overflow-hidden rounded-[1.7rem] border shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
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
                  <p className="mono-ui text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
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
              <TableCell className="mono-ui text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {formatDateTime(receipt.createdAt)}
              </TableCell>
              <TableCell>
                {receipt.externalTxId ? (
                  <span
                    title={receipt.externalTxId}
                    className="mono-ui block max-w-[11rem] truncate text-[11px] font-medium uppercase tracking-[0.12em] text-primary md:max-w-[14rem]"
                  >
                    {receipt.externalTxId}
                  </span>
                ) : typeof getReceiptMetadata(receipt.metadata)?.approvalUrl === "string" ? (
                  <a
                    href={String(getReceiptMetadata(receipt.metadata)?.approvalUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="mono-ui block max-w-[11rem] truncate text-[11px] font-medium uppercase tracking-[0.12em] text-primary underline-offset-4 hover:underline md:max-w-[14rem]"
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
            <tr className="border-t border-slate-900/8 bg-slate-950 text-white">
              <td colSpan={6} className="mono-ui p-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                Total spent (completed)
              </td>
              <td className="mono-ui p-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                {formatCurrency(totalSpentUsd)}
              </td>
            </tr>
          </tfoot>
        ) : null}
      </Table>
    </div>
  );
}
