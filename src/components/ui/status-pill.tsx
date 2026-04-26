import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * StatusPill — small rounded pill with optional leading dot.
 *
 * Tones map to existing semantic tokens; visual output matches the original
 * complee/StatusPill component exactly when used with default size.
 */
const pillVariants = cva(
  "inline-flex items-center rounded-full font-medium border",
  {
    variants: {
      tone: {
        brand: "bg-brand-soft text-brand border-brand/30",
        success: "bg-success-soft text-success-foreground border-success/30",
        warn: "bg-warn-soft text-warn-foreground border-warn/30",
        danger: "bg-danger-soft text-danger border-danger/30",
        neutral: "bg-muted text-muted-foreground border-border",
      },
      size: {
        sm: "gap-1.5 px-2.5 py-0.5 text-[11px]",
        md: "gap-1.5 px-3 py-1 text-xs",
      },
      borderless: {
        true: "border-transparent",
        false: "",
      },
    },
    defaultVariants: { tone: "neutral", size: "sm", borderless: false },
  },
);

const dotClass: Record<NonNullable<VariantProps<typeof pillVariants>["tone"]>, string> = {
  brand: "bg-brand",
  success: "bg-success",
  warn: "bg-warn",
  danger: "bg-danger",
  neutral: "bg-muted-foreground",
};

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pillVariants> {
  /** Show a small colored dot before the label. */
  dot?: boolean;
}

const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ className, tone, size, borderless, dot = false, children, ...props }, ref) => {
    const t = tone ?? "neutral";
    return (
      <span
        ref={ref}
        className={cn(pillVariants({ tone, size, borderless }), className)}
        {...props}
      >
        {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotClass[t])} />}
        {children}
      </span>
    );
  },
);
StatusPill.displayName = "StatusPill";

export { StatusPill, pillVariants };
