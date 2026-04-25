import { Globe, CreditCard, ShieldCheck } from "lucide-react";

const ITEMS = [
  { icon: Globe, label: "GDPR", sub: "Data Protection" },
  { icon: CreditCard, label: "PSD2 / PSD3", sub: "Payments Regulation" },
  { icon: ShieldCheck, label: "DORA", sub: "Operational Resilience" },
] as const;

function RibbonGroup({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center gap-3 sm:gap-4 px-2 sm:px-3"
      aria-hidden={ariaHidden || undefined}
    >
      {ITEMS.map(({ icon: Icon, label, sub }, i) => (
        <li key={`${label}-${i}`} className="flex items-center gap-3 sm:gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] sm:text-[13px] text-navy shadow-sm whitespace-nowrap">
            <Icon className="h-3.5 w-3.5 text-brand" aria-hidden />
            <span className="font-medium">{label}</span>
            <span className="text-muted-foreground font-normal">· {sub}</span>
          </span>
          <span
            className="hidden sm:inline-block h-1 w-1 rounded-full bg-border"
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
      aria-label="Regulatory frameworks supported"
      className="relative bg-transparent"
    >
      {/* Edge fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="overflow-hidden py-3 sm:py-4">
        <div className="flex w-max animate-marquee motion-reduce:animate-none">
          {/* Two identical groups for a seamless -50% loop */}
          <RibbonGroup />
          <RibbonGroup ariaHidden />
        </div>
      </div>
    </section>
  );
}
