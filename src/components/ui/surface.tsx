import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Surface — the canonical "card-like" panel used across the app.
 *
 * Replaces the repeated `rounded-2xl border bg-card shadow-sm p-*` pattern.
 * Variants are designed to match the existing visual output exactly — pick
 * the combination that mirrors the current classes when refactoring.
 *
 * Convention (see audit):
 *  - Cards / panels  → radius "2xl"
 *  - Inputs/Buttons  → radius "md" (use ui/button, ui/input)
 *  - Pills           → radius "full" (use ui/status-pill, ui/badge)
 */
const surfaceVariants = cva("border bg-card", {
  variants: {
    elevation: {
      none: "",
      sm: "shadow-sm",
      lg: "shadow-lg",
      "2xl": "shadow-2xl",
    },
    radius: {
      none: "",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    elevation: "sm",
    radius: "2xl",
    padding: "none",
  },
});

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {
  asChild?: boolean;
}

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, elevation, radius, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(surfaceVariants({ elevation, radius, padding }), className)}
      {...props}
    />
  ),
);
Surface.displayName = "Surface";

export { Surface, surfaceVariants };
