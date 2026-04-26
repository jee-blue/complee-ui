import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ITEMS = [
  {
    code: "PSD3",
    label: "Payments",
    title: "Payment Services Directive 3",
    impact: "Impacts payment institutions, e-money issuers, and open banking APIs.",
  },
  {
    code: "GDPR",
    label: "Data Protection",
    title: "General Data Protection Regulation",
    impact: "Impacts how customer data is collected, processed, stored, and transferred.",
  },
  {
    code: "DORA",
    label: "Resilience",
    title: "Digital Operational Resilience Act",
    impact: "Impacts ICT risk, third-party providers, and operational continuity.",
  },
] as const;

export default function RegulatoryRibbon() {
  return (
    <TooltipProvider delayDuration={120}>
      <div
        role="list"
        aria-label="Regulatory frameworks covered"
        className="w-full max-w-[680px] mx-auto flex items-center gap-2 sm:gap-2.5 overflow-x-auto sm:overflow-visible rounded-full border border-navy-foreground/15 bg-navy-foreground/[0.04] backdrop-blur-md px-2 py-2"
      >
        {ITEMS.map((item) => (
          <Tooltip key={item.code}>
            <TooltipTrigger asChild>
              <div
                role="listitem"
                tabIndex={0}
                className="group flex-1 min-w-fit inline-flex items-center justify-center gap-2 rounded-full px-3.5 py-1.5 text-navy-foreground/90 hover:bg-navy-foreground/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-foreground/60 transition-colors cursor-default whitespace-nowrap"
              >
                <span className="text-[13px] font-semibold tracking-wide">{item.code}</span>
                <span className="text-[12px] text-navy-foreground/60">{item.label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[260px] text-left">
              <div className="text-[12px] font-semibold">{item.title}</div>
              <div className="mt-1 text-[11.5px] text-muted-foreground">{item.impact}</div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
