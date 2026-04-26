import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  ArrowRight,
  Database,
  GitCompareArrows,
  Map,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Chrome } from "@/components/complee/Chrome";
import { REGULATORS, getRequirements } from "@/data/requirements";
import RegulatoryRibbon from "@/components/complee/RegulatoryRibbon";
import { HowItWorksScroller } from "@/components/complee/HowItWorksScroller";
import { Surface } from "@/components/ui/surface";

const RotatingEarth = lazy(
  () => import("@/components/ui/wireframe-dotted-globe"),
);

function HeroGlobe() {
  const [mounted, setMounted] = useState(false);
  const [size, setSize] = useState(520);
  useEffect(() => {
    setMounted(true);
    const calc = () => {
      const w = window.innerWidth;
      if (w < 1024) setSize(380);
      else if (w < 1280) setSize(440);
      else if (w < 1536) setSize(500);
      else setSize(560);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  if (!mounted) {
    return <div style={{ width: 520, height: 520 }} aria-hidden />;
  }
  return (
    <Suspense fallback={<div style={{ width: size, height: size }} />}>
      <RotatingEarth width={size} height={size} />
    </Suspense>
  );
}



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
      <>
        {/* 1. HERO — premium dark, full viewport, left/right split */}
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden bg-navy text-navy-foreground"
        style={{ minHeight: "calc(100vh - 60px)" }}
      >
        {/* Subtle dotted grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, oklch(1 0 0 / 0.7) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Abstract brand glows (navy/blue only) */}
        <div
          aria-hidden="true"
          className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full blur-[120px] opacity-30 pointer-events-none bg-brand"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[-20%] right-[-10%] h-[480px] w-[480px] rounded-full blur-[120px] opacity-25 pointer-events-none bg-brand-strong"
        />

        <div
          className="relative max-w-[1440px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col"
          style={{ minHeight: "calc(100vh - 60px)" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1 py-10 sm:py-14 lg:py-16">
            {/* LEFT — editorial copy (7 cols). Flex column so we can reorder the
                globe to sit between ribbon and status badge on mobile. */}
            <div className="lg:col-span-7 text-left lg:pr-8 xl:pr-12 flex flex-col">
              <h1
                id="hero-heading"
                className="font-semibold text-navy-foreground tracking-tight order-1"
                style={{
                  fontSize: "clamp(2.5rem, 1.4rem + 4.2vw, 5.25rem)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.025em",
                }}
              >
                Expand into regulated markets{" "}
                <span className="text-brand-foreground">
                  with{" "}
                  <span className="italic font-normal underline decoration-brand decoration-[3px] underline-offset-[8px]">
                    confidence
                  </span>
                </span>
                .
              </h1>

              <p
                className="order-2 mt-6 sm:mt-7 text-navy-foreground/75 max-w-[620px]"
                style={{
                  fontSize: "clamp(1rem, 0.9rem + 0.4vw, 1.2rem)",
                  lineHeight: 1.55,
                }}
              >
                Assess regulatory readiness across GDPR, PSD2/PSD3 and DORA before
                expansion risk becomes expensive.
              </p>

              <div className="order-3 mt-8 sm:mt-10 flex items-center gap-3 flex-wrap">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand text-brand-foreground px-6 py-3 min-h-[48px] text-[15px] font-medium hover:bg-brand/90 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
                >
                  Assess Expansion Readiness
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-lg border border-navy-foreground/20 bg-transparent px-5 py-3 min-h-[48px] text-[14px] font-medium text-navy-foreground hover:bg-navy-foreground/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
                >
                  How It Works
                </a>
              </div>

              {/* Regulatory ribbon — directly below CTA, anchored to text column */}
              <div className="order-4 mt-6 sm:mt-8 max-w-[560px] w-full">
                <RegulatoryRibbon />
              </div>

              {/* Live proof bar */}
              <div
                role="status"
                className="order-6 lg:order-5 mt-6 sm:mt-7 inline-flex items-center gap-2.5 rounded-full border border-navy-foreground/15 bg-navy-foreground/5 px-3.5 py-2 text-[12px] sm:text-[13px] text-navy-foreground/85 self-start"
              >
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                Live regulatory data tracking {total} requirements across {authorityCount} European regulators
              </div>
            </div>

            {/* RIGHT — rotating dotted globe (5 cols).
                On mobile the globe lives in source order between ribbon (order-4)
                and status badge (order-6) via order-5; on lg+ it returns to the
                right column. */}
            <div className="order-5 lg:order-none lg:col-span-5 relative flex items-center justify-center mt-8 lg:mt-0">
              <HeroGlobe />
            </div>
          </div>

        </div>
      </section>

        </div>
      </section>

      {/* 2. VALUE PROPOSITION */}
      <section
        id="why-complee"
        aria-labelledby="value-heading"
        className="border-t border-border bg-surface-muted/40 scroll-mt-20 min-h-screen flex items-center"
      >
        <div className="w-full max-w-[1080px] 2xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
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

      {/* 3. HOW IT WORKS — sticky scroll-driven walkthrough */}
      <HowItWorksScroller />

      {/* 4. USE CASES */}
      <section
        id="use-cases"
        aria-labelledby="usecases-heading"
        className="border-t border-border bg-surface-muted/40 scroll-mt-20 min-h-screen flex items-center"
      >
        <div className="w-full max-w-[1080px] 2xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
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

      {/* 5. COVERAGE — IMPACT / PROOF BAND */}
      <section
        id="coverage"
        aria-labelledby="impact-heading"
        className="relative overflow-hidden border-t border-border bg-navy text-navy-foreground scroll-mt-20 min-h-screen flex items-center"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, oklch(1 0 0 / 0.6) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full blur-[100px] opacity-30 pointer-events-none bg-brand"
          aria-hidden="true"
        />
        <div className="relative w-full max-w-[1080px] 2xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-7">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-foreground/70">
                Impact
              </div>
              <h2
                id="impact-heading"
                className="mt-3 fluid-display font-semibold text-navy-foreground"
              >
                Cut expansion readiness assessment time by{" "}
                <span className="text-brand-foreground underline decoration-brand decoration-[3px] underline-offset-[6px]">
                  50%
                </span>
                .
              </h2>
              <p className="mt-5 max-w-[560px] text-[15px] sm:text-[16px] leading-relaxed text-navy-foreground/80">
                Assess gaps across GDPR, PSD3 and DORA in minutes, not weeks — using live
                regulator data, not consultant decks.
              </p>
            </div>

            <div className="lg:col-span-5">
              <dl className="grid grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.1em] text-navy-foreground/60">
                    Faster
                  </dt>
                  <dd className="mt-2 text-[2rem] sm:text-[2.5rem] font-semibold text-navy-foreground tabular-nums leading-none">
                    50%
                  </dd>
                  <p className="mt-1.5 text-[12px] text-navy-foreground/70">
                    vs. manual review
                  </p>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.1em] text-navy-foreground/60">
                    Coverage
                  </dt>
                  <dd className="mt-2 text-[2rem] sm:text-[2.5rem] font-semibold text-navy-foreground tabular-nums leading-none">
                    {total}
                  </dd>
                  <p className="mt-1.5 text-[12px] text-navy-foreground/70">
                    requirements tracked
                  </p>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.1em] text-navy-foreground/60">
                    Regulators
                  </dt>
                  <dd className="mt-2 text-[2rem] sm:text-[2.5rem] font-semibold text-navy-foreground tabular-nums leading-none">
                    {authorityCount}
                  </dd>
                  <p className="mt-1.5 text-[12px] text-navy-foreground/70">
                    European authorities
                  </p>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 pt-8 border-t border-navy-foreground/10">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-foreground/60 text-center">
              Sourced from European regulators
            </div>
            <ul
              className="mt-5 flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-3 text-navy-foreground/85"
              aria-label="Regulator credibility row"
            >
              {["FCA", "ACPR", "BaFin", "DNB"].map((r) => (
                <li
                  key={r}
                  className="text-[16px] sm:text-[18px] font-semibold tracking-wide"
                >
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. SAMPLE OUTPUT PREVIEW */}
      <section
        id="demo-results"
        aria-labelledby="preview-heading"
        className="border-t border-border bg-surface-muted/40 scroll-mt-20 min-h-screen flex items-center"
      >
        <div className="w-full max-w-[1080px] 2xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* LEFT — explanatory content */}
            <div className="lg:col-span-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Demo Results Preview
              </div>
              <h2
                id="preview-heading"
                className="mt-2 fluid-h2 font-semibold text-navy"
              >
                See your readiness before expanding
              </h2>
              <ul className="mt-6 space-y-3 text-[14px] text-navy">
                {[
                  "Get your readiness score",
                  "See critical gaps and missing requirements",
                  "Understand estimated remediation effort",
                  "Export your expansion roadmap",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="h-4 w-4 text-success mt-0.5 shrink-0"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT — two cards */}
            <div className="lg:col-span-7 lg:justify-self-end lg:max-w-[640px] w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Card 1 — Readiness Score */}
              <Surface padding="md">
                <div className="text-[12px] text-muted-foreground">
                  Readiness Score
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-[44px] leading-none font-semibold text-brand tabular-nums">
                    72%
                  </div>
                </div>
                <p className="mt-2 text-[12px] text-muted-foreground">
                  Moderate Readiness
                </p>
                <div
                  className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={72}
                  aria-label="Sample readiness score: 72 of 100"
                >
                  <div className="h-full bg-brand" style={{ width: "72%" }} />
                </div>
                <div className="mt-6 pt-5 border-t border-border">
                  <div className="text-[12px] text-muted-foreground">
                    Estimated Remediation Effort
                  </div>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 text-[18px] font-semibold text-navy">
                    <Clock className="h-4 w-4 text-brand" aria-hidden />
                    6 weeks
                  </div>
                </div>
              </Surface>

              {/* Card 2 — Top Findings */}
              <Surface padding="md">
                <div className="text-[12px] font-semibold text-navy">
                  Top Findings
                </div>
                <ul className="mt-3 divide-y divide-border">
                  {[
                    {
                      icon: (
                        <XCircle className="h-4 w-4 text-danger" aria-hidden />
                      ),
                      bg: "bg-danger/10",
                      title: "3 Critical gaps",
                      sub: "Require immediate attention",
                    },
                    {
                      icon: (
                        <AlertTriangle
                          className="h-4 w-4 text-warning-foreground"
                          aria-hidden
                        />
                      ),
                      bg: "bg-warning/20",
                      title: "4 Partial requirements",
                      sub: "Partially implemented controls",
                    },
                    {
                      icon: (
                        <Clock className="h-4 w-4 text-brand" aria-hidden />
                      ),
                      bg: "bg-brand/10",
                      title: "3 Missing requirements",
                      sub: "Not yet addressed",
                    },
                  ].map((f) => (
                    <li
                      key={f.title}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${f.bg} shrink-0`}
                      >
                        {f.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-semibold text-navy">
                          {f.title}
                        </div>
                        <div className="text-[12px] text-muted-foreground">
                          {f.sub}
                        </div>
                      </div>
                      <ArrowRight
                        className="h-4 w-4 text-muted-foreground shrink-0"
                        aria-hidden
                      />
                    </li>
                  ))}
                </ul>
              </Surface>
            </div>
          </div>
        </div>
      </section>


      {/* 6. FINAL CTA */}
      <section aria-labelledby="final-cta-heading" className="border-t border-border bg-navy min-h-screen flex items-center">
        <div className="w-full max-w-[1080px] 2xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2
            id="final-cta-heading"
            className="fluid-h2 font-semibold text-navy-foreground"
          >
            Start your expansion assessment
          </h2>
          <div className="mt-8 flex items-center justify-center">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-lg bg-brand text-brand-foreground px-6 py-3 min-h-[48px] text-[15px] font-medium hover:bg-brand/90 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            >
              Start Assessment
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <nav
            aria-label="Footer"
            className="mt-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] text-navy-foreground/75"
          >
            <a href="#why-complee" className="hover:text-navy-foreground transition-colors">Product</a>
            <span aria-hidden="true" className="text-navy-foreground/30">·</span>
            <a href="#use-cases" className="hover:text-navy-foreground transition-colors">How it works</a>
            <span aria-hidden="true" className="text-navy-foreground/30">·</span>
            <a href="#demo-results" className="hover:text-navy-foreground transition-colors">Demo results</a>
            <span aria-hidden="true" className="text-navy-foreground/30">·</span>
            <a href="mailto:hello@complee.app" className="hover:text-navy-foreground transition-colors">Contact</a>
          </nav>
          <p className="mt-6 text-[12px] text-navy-foreground/60">
            This is a readiness assessment, not legal advice.
          </p>
        </div>
      </section>
      </>
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

