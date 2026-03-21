import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "mono-ui inline-flex items-center justify-center gap-2 rounded-full border text-sm font-semibold uppercase tracking-[0.18em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-cyan-300/20 bg-cyan-400 text-slate-950 shadow-panel hover:-translate-y-0.5 hover:bg-cyan-300",
        secondary:
          "border-amber-300/25 bg-amber-200 text-slate-950 shadow-panel hover:-translate-y-0.5 hover:bg-amber-100",
        outline:
          "border-slate-300/30 bg-slate-950/80 text-slate-100 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-slate-900",
        ghost: "border-transparent bg-transparent text-slate-100 hover:bg-white/8",
        destructive: "border-red-300/20 bg-destructive text-destructive-foreground hover:bg-destructive/90"
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-[11px]",
        lg: "h-12 px-6",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
