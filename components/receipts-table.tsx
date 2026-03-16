import { ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusChip } from "@/components/status-chip";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

export function ReceiptsTable({
  receipts
}: {
  receipts: Array<{
    id: string;
    provider: string;
    purpose: string;
    amountUsd: number;
    status: string;
    externalTxId?: string | null;
    reason: string;
    createdAt: string;
    run?: {
      triggerSummary: string;
      strategyName: string;
    };
  }>;
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
            <TableHead>Receipt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((receipt) => (
            <TableRow key={receipt.id}>
              <TableCell className="font-medium">{receipt.provider}</TableCell>
              <TableCell>
                <p>{receipt.purpose}</p>
                <p className="text-xs text-muted-foreground">{receipt.reason}</p>
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
                  <div className="inline-flex items-center gap-1 text-xs text-primary">
                    <ExternalLink className="h-3.5 w-3.5" />
                    {receipt.externalTxId}
                  </div>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
