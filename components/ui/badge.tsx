import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "status-capsule",
  {
    variants: {
      variant: {
        default: "border-cyan-400/20 bg-cyan-400/12 text-cyan-800",
        success: "border-emerald-500/15 bg-emerald-100 text-emerald-800",
        warning: "border-amber-500/20 bg-amber-100 text-amber-900",
        destructive: "border-red-500/20 bg-red-100 text-red-800",
        muted: "border-slate-300/20 bg-slate-900/10 text-slate-600",
        info: "border-cyan-500/15 bg-cyan-100 text-cyan-900"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
