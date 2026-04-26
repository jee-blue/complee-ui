import type { ReactNode } from "react";

/**
 * Unified layout shell for all assessment steps (Company Scope, Documents,
 * Processing, Results). Guarantees identical spacing rhythm, max-width and
 * hero hierarchy across every step so the flow feels like one guided journey.
 *
 * Spacing system (8pt grid):
 *  - top padding to first content: 80–112px
 *  - eyebrow → h1: 24px
 *  - h1 → body: 28–32px
 *  - hero → first card: 64–80px
 *  - section → section: 48–56px
 */
export function StepShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  width = "narrow",
  headerAside,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: "narrow" | "wide";
  headerAside?: ReactNode;
}) {
  const containerWidth = width === "wide" ? "max-w-[1200px]" : "max-w-[880px]";
  return (
    <div
      className={`${containerWidth} mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-20`}
    >
      {/* Hero intro */}
      <div className="mb-16 sm:mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[12px] uppercase tracking-[0.16em] text-brand font-semibold mb-6">
            {eyebrow}
          </p>
          <h1 className="text-[32px] sm:text-[42px] font-semibold tracking-tight text-navy leading-[1.15]">
            {title}
          </h1>
          {description && (
            <div className="mt-7 sm:mt-8 text-[16px] sm:text-[17px] text-muted-foreground max-w-[620px] leading-relaxed">
              {description}
            </div>
          )}
        </div>
        {headerAside && <div className="shrink-0">{headerAside}</div>}
      </div>

      {/* Step body */}
      <div className="space-y-12 sm:space-y-14">{children}</div>

      {/* Footer / CTA */}
      {footer && <div className="mt-12 sm:mt-14">{footer}</div>}
    </div>
  );
}
