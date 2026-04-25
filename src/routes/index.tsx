import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Database,
  GitCompareArrows,
  Map,
  ShieldCheck,
  Sparkles,
  ClipboardList,
  Search,
  Route as RouteIcon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Chrome } from "@/components/complee/Chrome";
import { RegulatoryRibbon } from "@/components/complee/RegulatoryRibbon";
import { REGULATORS, getRequirements } from "@/data/requirements";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Complee — Compliance Intelligence for FinTech Expansion" },
      {
        name: "description",
        content:
          "Assess regulatory readiness before entering new European markets with a data-driven compliance assessment.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const requirements = getRequirements();
  const total = requirements.length;
  const authorityCount = new Set(
    requirements.length > 0
      ? requirements.map((r) => r.authority)
      : REGULATORS.map((r) => r.authority),
  ).size;

  return (
    <Chrome>
      {/* 1. HERO */}
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden complee-soft-glow"
      >
        <div
          className="absolute inset-0 complee-grid-bg opacity-60 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative max-w-[1080px] 2xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 md:pt-28 pb-10 md:pb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] sm:text-[12px] text-muted-foreground mb-6 sm:mb-8 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            For Heads of Compliance, Expansion, and COOs
          </div>

          <h1 id="hero-heading" className="fluid-h1 font-semibold text-navy">
            Know your expansion readiness
            <br />
            <span className="text-brand">before regulators do.</span>
          </h1>

          <p className="mt-5 sm:mt-6 fluid-lead text-muted-foreground max-w-[680px] 2xl:max-w-[780px] mx-auto">
            Compliance intelligence for FinTechs entering new European markets — backed by real
            regulator data, not generic AI.
          </p>

          <div className="mt-8 sm:mt-10 flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-lg bg-navy text-navy-foreground px-6 py-3 min-h-[48px] text-[15px] font-medium hover:bg-navy/90 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Assess Expansion Readiness
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div
            role="status"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success-soft px-3 py-1.5 text-[12px] sm:text-[13px] text-success-foreground"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Live regulatory data tracking {total} requirements across {authorityCount} European
            regulators
          </div>

          {/* Regulatory ribbon */}
          <section
            id="requirements"
            aria-labelledby="requirements-heading"
            className="mt-12 sm:mt-16 -mx-4 sm:-mx-6 lg:-mx-8 scroll-mt-24"
          >
            <div className="px-4 sm:px-6 lg:px-8 mb-4 sm:mb-5 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Expansion Requirements Covered
              </div>
            </div>
            <RegulatoryRibbon />
          </section>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION */}
      <section
        aria-labelledby="value-heading"
        className="border-t border-border bg-surface-muted/40"
      >
        <div className="max-w-[1080px] 2xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="text-center max-w-[720px] mx-auto">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Why Complee
            </div>
            <h2 id="value-heading" className="mt-2 fluid-h2 font-semibold text-navy">
              Know what blocks expansion before regulators do
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
            <ValueCard
              icon={<Database className="h-4 w-4" aria-hidden="true" />}
              title="Real Regulatory Data"
              body="Requirements sourced from FCA, ACPR, BaFin and other regulators — not generic AI output."
            />
            <ValueCard
              icon={<GitCompareArrows className="h-4 w-4" aria-hidden="true" />}
              title="Cross-Border Gap Analysis"
              body="Identify which controls are ready, partial, or missing."
            />
            <ValueCard
              icon={<Map className="h-4 w-4" aria-hidden="true" />}
              title="Execution-Ready Roadmap"
              body="Receive a prioritized action plan for expansion readiness."
            />
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" aria-labelledby="how-heading" className="border-t border-border scroll-mt-20">
        <div className="max-w-[1080px] 2xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="text-center max-w-[720px] mx-auto">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              How It Works
            </div>
            <h2 id="how-heading" className="mt-2 fluid-h2 font-semibold text-navy">
              Three steps to expansion readiness
            </h2>
          </div>

          <ol className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <StepCard
              n={1}
              icon={<ClipboardList className="h-4 w-4" aria-hidden="true" />}
              title="Answer a short readiness assessment"
              body="Tell us your home market, target market, and the services you provide."
            />
            <StepCard
              n={2}
              icon={<Search className="h-4 w-4" aria-hidden="true" />}
              title="Identify regulatory gaps for target market"
              body="See which controls are covered, partial, or missing against real regulator data."
            />
            <StepCard
              n={3}
              icon={<RouteIcon className="h-4 w-4" aria-hidden="true" />}
              title="Receive an expansion roadmap"
              body="Prioritized actions with owners and effort, ready for your team."
            />
          </ol>
        </div>
      </section>

      {/* 4. SAMPLE OUTPUT PREVIEW */}
      <section
        id="demo-results"
        aria-labelledby="preview-heading"
        className="border-t border-border bg-surface-muted/40 scroll-mt-20"
      >
        <div className="max-w-[1080px] 2xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="text-center max-w-[720px] mx-auto">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Sample Output
            </div>
            <h2 id="preview-heading" className="mt-2 fluid-h2 font-semibold text-navy">
              See your readiness before expanding
            </h2>
            <p className="mt-3 text-[14px] text-muted-foreground">
              Example: a French EMI assessing UK market entry.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-success" aria-hidden />
                Live preview · FR → GB
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Readiness Report
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-0">
              {/* Score */}
              <div className="p-6 border-b lg:border-b-0 lg:border-r border-border">
                <div className="text-[12px] text-muted-foreground">Readiness Score</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-[44px] leading-none font-semibold text-navy tabular-nums">
                    62
                  </div>
                  <div className="text-[14px] text-muted-foreground">/ 100</div>
                </div>
                <div
                  className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={62}
                  aria-label="Sample readiness score: 62 of 100"
                >
                  <div className="h-full bg-brand" style={{ width: "62%" }} />
                </div>
                <p className="mt-3 text-[12px] text-muted-foreground">
                  Moderate readiness. Address critical gaps before applying for authorisation.
                </p>
              </div>

              {/* Critical gaps */}
              <div className="p-6 border-b lg:border-b-0 lg:border-r border-border">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning-foreground" aria-hidden="true" />
                  <div className="text-[12px] font-semibold text-navy">Critical Gaps</div>
                </div>
                <ul className="mt-3 space-y-2 text-[13px]">
                  <li className="flex items-start gap-2">
                    <XCircle className="h-3.5 w-3.5 text-danger mt-0.5 shrink-0" aria-hidden />
                    <span className="text-navy">CASS 15 — Safeguarding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-3.5 w-3.5 text-danger mt-0.5 shrink-0" aria-hidden />
                    <span className="text-navy">Consumer Duty outcomes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-3.5 w-3.5 text-danger mt-0.5 shrink-0" aria-hidden />
                    <span className="text-navy">SM&amp;CR governance map</span>
                  </li>
                </ul>
              </div>

              {/* Missing & effort */}
              <div className="p-6">
                <div className="text-[12px] font-semibold text-navy">Coverage Summary</div>
                <ul className="mt-3 space-y-2 text-[13px]">
                  <li className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-navy">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden /> Covered
                    </span>
                    <span className="tabular-nums text-muted-foreground">5</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-navy">
                      <Clock className="h-3.5 w-3.5 text-brand" aria-hidden /> Partial
                    </span>
                    <span className="tabular-nums text-muted-foreground">2</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-navy">
                      <XCircle className="h-3.5 w-3.5 text-danger" aria-hidden /> Missing
                    </span>
                    <span className="tabular-nums text-muted-foreground">3</span>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-[12px] text-muted-foreground">Estimated remediation</div>
                  <div className="mt-1 text-[18px] font-semibold text-navy">8–12 weeks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. USE CASES */}
      <section id="use-cases" aria-labelledby="usecases-heading" className="border-t border-border scroll-mt-20">
        <div className="max-w-[1080px] 2xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="text-center max-w-[720px] mx-auto">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Use Cases
            </div>
            <h2 id="usecases-heading" className="mt-2 fluid-h2 font-semibold text-navy">
              Built for FinTech expansion use cases
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <UseCaseCard
              tag="Market entry"
              title="France to UK expansion readiness"
              body="Assess what an ACPR-authorised EMI needs to operate under FCA rules."
            />
            <UseCaseCard
              tag="Licensing"
              title="Payment licensing requirement checks"
              body="Map PSD2 / PSD3 obligations and authorisation prerequisites by market."
            />
            <UseCaseCard
              tag="Resilience"
              title="Operational resilience gap review"
              body="Compare existing DORA controls against target-market expectations."
            />
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section aria-labelledby="final-cta-heading" className="border-t border-border bg-navy">
        <div className="max-w-[1080px] 2xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2
            id="final-cta-heading"
            className="fluid-h2 font-semibold text-navy-foreground"
          >
            Assess Expansion Readiness Today
          </h2>
          <p className="mt-3 text-[14px] sm:text-[15px] text-navy-foreground/80 max-w-[560px] mx-auto">
            Get a clear, data-backed view of what stands between your business and your next
            European market.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-lg bg-brand text-brand-foreground px-6 py-3 min-h-[48px] text-[15px] font-medium hover:bg-brand/90 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            >
              Start Assessment
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-6 text-[12px] text-navy-foreground/70">
            <ShieldCheck
              className="inline h-3.5 w-3.5 mr-1 -mt-0.5"
              aria-hidden="true"
            />
            Powered by real regulator data from ACPR, BaFin, DNB, Banco de España, and the FCA.
          </p>
        </div>
      </section>
    </Chrome>
  );
}

function ValueCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
      <div className="h-8 w-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="text-[14px] font-semibold text-navy">{title}</div>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function StepCard({
  n,
  icon,
  title,
  body,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-navy text-navy-foreground text-[12px] font-semibold tabular-nums">
          {n}
        </span>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand">
          {icon}
        </span>
      </div>
      <div className="mt-3 text-[14px] font-semibold text-navy">{title}</div>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
    </li>
  );
}

function UseCaseCard({
  tag,
  title,
  body,
}: {
  tag: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.1em] text-brand bg-brand-soft rounded-full px-2 py-0.5">
        {tag}
      </span>
      <div className="mt-3 text-[14px] font-semibold text-navy">{title}</div>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
