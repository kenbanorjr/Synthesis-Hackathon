"use client";

import { startTransition, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

async function resolveApproval(approvalId: string, action: "approve" | "reject", note: string) {
  const response = await fetch(`/api/approvals/${approvalId}/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      note: note.trim() || undefined
    })
  });

  const payload = (await response.json()) as { error: { message: string } | null };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Failed to resolve approval.");
  }
}

export function ApprovalActions({ approvalId }: { approvalId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(null);

  function submit(action: "approve" | "reject") {
    setPendingAction(action);

    startTransition(async () => {
      try {
        await resolveApproval(approvalId, action, note);
        toast.success(action === "approve" ? "Approval granted." : "Approval rejected.");
        setNote("");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to resolve approval.");
      } finally {
        setPendingAction(null);
      }
    });
  }

  const isPending = pendingAction !== null;

  return (
    <div className="mt-4 rounded-[1.25rem] border border-amber-200/80 bg-white/70 p-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-amber-950">Resolve approval request</p>
        <p className="text-sm text-amber-900/80">
          Record the operator decision and update the Locus receipt trail without leaving the demo flow.
        </p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <Input
          aria-label="Operator note"
          maxLength={240}
          placeholder="Optional operator note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <Button disabled={isPending} size="sm" type="button" onClick={() => submit("approve")}>
          <CheckCircle2 className="h-4 w-4" />
          {pendingAction === "approve" ? "Approving..." : "Approve"}
        </Button>
        <Button
          disabled={isPending}
          size="sm"
          type="button"
          variant="destructive"
          onClick={() => submit("reject")}
        >
          <XCircle className="h-4 w-4" />
          {pendingAction === "reject" ? "Rejecting..." : "Reject"}
        </Button>
      </div>
    </div>
  );
}
