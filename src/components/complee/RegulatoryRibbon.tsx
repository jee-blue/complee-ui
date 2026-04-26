import { Globe, CreditCard, ShieldCheck } from "lucide-react";

const ITEMS = [
  { icon: Globe, label: "GDPR", sub: "Data Protection Requirement" },
  { icon: CreditCard, label: "PSD2 / PSD3", sub: "Payments Regulation Requirement" },
  { icon: ShieldCheck, label: "DORA", sub: "Operational Resilience Requirement" },
] as const;

function RibbonGroup({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center gap-3 sm:gap-4 px-2 sm:px-3"
      aria-hidden={ariaHidden || undefined}
    >
      {ITEMS.map(({ icon: Icon, label, sub }, i) => (
        <li key={`${label}-${i}`} className="flex items-center gap-3 sm:gap-4">
          <span className="inline-flex items-center gap-2.5 rounded-xl border border-navy-foreground/12 bg-navy-foreground/[0.04] px-4 py-2.5 backdrop-blur-sm whitespace-nowrap">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand/20 text-brand-foreground">
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="flex flex-col items-start leading-tight text-left">
              <span className="text-[13px] font-semibold text-navy-foreground">
                {label}
              </span>
              <span className="text-[11px] text-navy-foreground/60">{sub}</span>
            </span>
          </span>
          <span
            className="hidden sm:inline-block h-1 w-1 rounded-full bg-navy-foreground/20"
            aria-hidden
          />
        </li>
      ))}
    </ul>
  );
}

export function RegulatoryRibbon() {
  return (
    <section
      aria-labelledby="requirements-heading"
      id="requirements"
      className="relative bg-transparent scroll-mt-24"
    >
      <div className="flex items-center gap-3 mb-3">
        <h2
          id="requirements-heading"
          className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-navy-foreground/55"
        >
          Expansion Requirements Covered
        </h2>
        <div className="h-px flex-1 bg-navy-foreground/10" aria-hidden />
      </div>

      {/* Edge fade masks blend into the navy hero */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-navy to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-navy to-transparent z-10" />

        <div className="overflow-hidden py-2 sm:py-3">
          <div className="flex w-max animate-marquee motion-reduce:animate-none">
            <RibbonGroup />
            <RibbonGroup ariaHidden />
          </div>
        </div>
      </div>
    </section>
  );
}

