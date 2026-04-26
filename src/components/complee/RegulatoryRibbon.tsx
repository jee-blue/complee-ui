import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Reg = {
  acronym: string;
  label: string;
  description: string;
  impact: string;
};

const REGULATIONS: Reg[] = [
  {
    acronym: "PSD3",
    label: "Payments",
    description: "Revised Payment Services Directive",
    impact: "Impacts payment initiation, account access & transaction security",
  },
  {
    acronym: "GDPR",
    label: "Data Protection",
    description: "General Data Protection Regulation",
    impact: "Impacts user privacy, data handling & cross-border transfers",
  },
  {
    acronym: "DORA",
    label: "Resilience",
    description: "Digital Operational Resilience Act",
    impact: "Impacts IT systems, incident reporting & third-party risk",
  },
];

function RibbonItem({ reg }: { reg: Reg }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="group inline-flex items-center gap-2 rounded-full border border-navy-foreground/10 bg-navy-foreground/[0.04] px-3 sm:px-4 py-1 backdrop-blur-sm transition-colors hover:border-navy-foreground/25 hover:bg-navy-foreground/[0.09]"
          tabIndex={0}
        >
          <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-navy-foreground/90 group-hover:text-navy-foreground">
            {reg.acronym}
          </span>
          <span className="h-3 w-px bg-navy-foreground/15" aria-hidden />
          <span className="text-[11px] font-medium text-navy-foreground/55 group-hover:text-navy-foreground/80">
            {reg.label}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px]">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold">{reg.description}</p>
          <p className="text-[11px] opacity-80">{reg.impact}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export default function RegulatoryRibbon() {
  // Duplicate the list so the -50% translate produces a seamless loop.
  const loop = [...REGULATIONS, ...REGULATIONS, ...REGULATIONS, ...REGULATIONS];

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className="group/ribbon relative w-full overflow-hidden rounded-full border border-navy-foreground/10 bg-navy-foreground/[0.03] py-1.5 sm:py-2 backdrop-blur-md opacity-80 hover:opacity-100 transition-opacity"
        aria-label="Regulatory coverage"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div
          className="flex w-max items-center gap-2 sm:gap-3 px-3 [animation:var(--animate-marquee)] group-hover/ribbon:[animation-play-state:paused] motion-reduce:[animation:none]"
        >
          {loop.map((reg, i) => (
            <RibbonItem key={`${reg.acronym}-${i}`} reg={reg} />
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
