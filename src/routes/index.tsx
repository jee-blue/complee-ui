import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Database,
  GitCompareArrows,
  Map,
  ShieldCheck,
  ClipboardList,
  Search,
  Route as RouteIcon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  CreditCard,
} from "lucide-react";
import { Chrome } from "@/components/complee/Chrome";
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
          className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full blur-[120px] opacity-30 pointer-events-none"
          style={{ background: "var(--color-brand)" }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[-20%] right-[-10%] h-[480px] w-[480px] rounded-full blur-[120px] opacity-25 pointer-events-none"
          style={{ background: "oklch(0.45 0.18 263)" }}
        />

        <div
          className="relative max-w-[1440px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col"
          style={{ minHeight: "calc(100vh - 60px)" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1 py-10 sm:py-14 lg:py-16">
            {/* LEFT — editorial copy */}
            <div className="lg:col-span-7 text-left">
              <h1
                id="hero-heading"
                className="font-semibold text-navy-foreground tracking-tight"
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
                className="mt-6 sm:mt-7 text-navy-foreground/75 max-w-[620px]"
                style={{
                  fontSize: "clamp(1rem, 0.9rem + 0.4vw, 1.2rem)",
                  lineHeight: 1.55,
                }}
              >
                Assess regulatory readiness across GDPR, PSD2/PSD3 and DORA before
                expansion risk becomes expensive.
              </p>

              <div className="mt-8 sm:mt-10 flex items-center gap-3 flex-wrap">
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

              {/* Live proof bar */}
              <div
                role="status"
                className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-navy-foreground/15 bg-navy-foreground/5 px-3.5 py-2 text-[12px] sm:text-[13px] text-navy-foreground/85"
              >
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                Live regulatory data tracking {total} requirements across {authorityCount} European regulators
              </div>
            </div>

            {/* RIGHT — abstract regulatory network visual */}
            <div className="lg:col-span-5 relative hidden md:block">
              <HeroNetworkVisual />
            </div>
          </div>

          {/* Bottom ribbon — Expansion Requirements Covered */}
          <div
            id="requirements"
            className="relative pb-6 sm:pb-8 scroll-mt-24"
            aria-labelledby="requirements-heading"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-navy-foreground/55">
                Expansion Requirements Covered
              </div>
              <div className="h-px flex-1 bg-navy-foreground/10" aria-hidden />
            </div>
            <ul
              className="flex flex-wrap items-center gap-2.5 sm:gap-3"
              aria-label="Regulatory frameworks supported"
            >
              {[
                { icon: Globe, label: "GDPR", sub: "Data Protection" },
                { icon: CreditCard, label: "PSD2 / PSD3", sub: "Payments" },
                { icon: ShieldCheck, label: "DORA", sub: "Operational Resilience" },
              ].map(({ icon: Icon, label, sub }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2.5 rounded-xl border border-navy-foreground/12 bg-navy-foreground/[0.04] px-3.5 py-2 backdrop-blur-sm"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand/20 text-brand-foreground">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-[12.5px] font-semibold text-navy-foreground">
                      {label}
                    </span>
                    <span className="text-[10.5px] text-navy-foreground/60">
                      {sub}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
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

          <ol className="mt-12 flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-4 text-left">
            <FlowStep
              n={1}
              icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
              title="Assess"
              body="Answer a short readiness assessment tailored to your business."
            />
            <FlowConnector />
            <FlowStep
              n={2}
              icon={<Search className="h-5 w-5" aria-hidden="true" />}
              title="Identify Gaps"
              body="See exactly which requirements are ready, partial, or missing for your target market."
            />
            <FlowConnector />
            <FlowStep
              n={3}
              icon={<RouteIcon className="h-5 w-5" aria-hidden="true" />}
              title="Receive Roadmap"
              body="Get a prioritized roadmap with actions, owners, and estimated effort."
            />
          </ol>
        </div>
      </section>

      {/* 4. IMPACT / PROOF BAND */}
      <section
        aria-labelledby="impact-heading"
        className="relative overflow-hidden border-t border-border bg-navy text-navy-foreground"
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
          className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full blur-[100px] opacity-30 pointer-events-none"
          aria-hidden="true"
          style={{ background: "var(--color-brand)" }}
        />
        <div className="relative max-w-[1080px] 2xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-28">
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

function FlowStep({
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
    <li className="flex-1 flex flex-col items-start gap-3 md:max-w-[280px]">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy text-navy-foreground text-[13px] font-semibold tabular-nums shadow-sm">
          {n}
        </span>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
          {icon}
        </span>
      </div>
      <div>
        <div className="text-[15px] font-semibold text-navy">{title}</div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground max-w-[260px]">
          {body}
        </p>
      </div>
    </li>
  );
}

function FlowConnector() {
  return (
    <div
      aria-hidden="true"
      className="hidden md:flex items-center justify-center pt-4 shrink-0"
    >
      <svg
        width="64"
        height="8"
        viewBox="0 0 64 8"
        fill="none"
        className="text-border"
      >
        <line
          x1="0"
          y1="4"
          x2="56"
          y2="4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M56 1 L62 4 L56 7"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
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
