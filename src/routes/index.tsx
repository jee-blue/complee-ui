import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Database,
  GitCompareArrows,
  Map,
  ShieldCheck,
  Sparkles,
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
          "Assess regulatory readiness before expanding into new European markets with a data-driven compliance assessment.",
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
      <section aria-labelledby="hero-heading" className="relative overflow-hidden">
        <div className="absolute inset-0 complee-grid-bg opacity-60 pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-[1080px] 2xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 md:pt-28 pb-12 md:pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] sm:text-[12px] text-muted-foreground mb-6 sm:mb-8">
            <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            For Heads of Compliance, Expansion, and COOs
          </div>

          {/* 1. Headline */}
          <h1 id="hero-heading" className="fluid-h1 font-semibold text-navy">
            Compliance Intelligence
            <br />
            <span className="text-brand">for FinTech Expansion</span>
          </h1>

          {/* 2. Subheadline */}
          <p className="mt-5 sm:mt-6 fluid-lead text-muted-foreground max-w-[640px] 2xl:max-w-[760px] mx-auto">
            Assess regulatory readiness before expanding into new European markets with a
            data-driven compliance assessment.
          </p>

          {/* 3. Primary CTA */}
          <div className="mt-8 sm:mt-10 flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-lg bg-navy text-navy-foreground px-6 py-3 min-h-[48px] text-[15px] font-medium hover:bg-navy/90 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Assess Expansion Readiness
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* 4. Live data proof bar */}
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

          {/* Value cards */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-[900px] 2xl:max-w-[1100px] mx-auto text-left">
            <ValueCard
              icon={<Database className="h-4 w-4" aria-hidden="true" />}
              title="Real regulatory data"
              body="Sourced from FCA, BaFin, ACPR, DNB and Banco de España — not generic AI guesses."
            />
            <ValueCard
              icon={<GitCompareArrows className="h-4 w-4" aria-hidden="true" />}
              title="Cross-border gap analysis"
              body="See exactly which controls you have, which are partial, and which are missing."
            />
            <ValueCard
              icon={<Map className="h-4 w-4" aria-hidden="true" />}
              title="Execution-ready roadmap"
              body="Owners, effort and cost estimates so your team can act on day one."
            />
          </div>

          {/* 5. Regulatory requirements ribbon */}
          <section
            aria-labelledby="requirements-heading"
            className="mt-16 sm:mt-20 -mx-4 sm:-mx-6 lg:-mx-8"
          >
            <div className="px-4 sm:px-6 lg:px-8 mb-4 sm:mb-5 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Key Regulatory Requirements We Assess
              </div>
              <h2 id="requirements-heading" className="mt-1.5 fluid-h2 font-semibold text-navy">
                Expansion Requirements Covered
              </h2>
            </div>
            <RegulatoryRibbon />
          </section>

          <p className="mt-12 text-[12px] sm:text-[13px] text-muted-foreground">
            <ShieldCheck className="inline h-3.5 w-3.5 text-success mr-1 -mt-0.5" aria-hidden="true" />
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
