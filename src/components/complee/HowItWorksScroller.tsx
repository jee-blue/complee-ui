import { useEffect, useRef, useState } from "react";
import { ClipboardList, Search, Route as RouteIcon } from "lucide-react";

/**
 * How It Works — sticky, scroll-driven storytelling section.
 *
 * Desktop: left column shows a sticky SVG product mock; right column lists
 * three steps. As the user scrolls, the active step is computed from which
 * step block is closest to the viewport center, and the corresponding mock
 * is shown on the left.
 *
 * Mobile: sticky behavior is disabled; each step renders with its mock
 * stacked directly above it for a linear walkthrough.
 *
 * The visuals are inline SVGs built with semantic Complee tokens
 * (oklch via Tailwind utilities) so colors/typography stay editable and
 * theme-consistent.
 */

type StepKey = "assess" | "gaps" | "roadmap";

interface Step {
  key: StepKey;
  n: number;
  title: string;
  body: string;
  icon: React.ReactNode;
  caption: string;
  Mock: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  {
    key: "assess",
    n: 1,
    title: "Assess",
    body: "Answer a short readiness assessment tailored to your business — institution type, services, home market and target market.",
    icon: <ClipboardList className="h-4 w-4" aria-hidden="true" />,
    caption: "Readiness assessment",
    Mock: AssessMock,
  },
  {
    key: "gaps",
    n: 2,
    title: "Identify Gaps",
    body: "See exactly which requirements are ready, partial, or missing for your target market — sourced from real regulator data.",
    icon: <Search className="h-4 w-4" aria-hidden="true" />,
    caption: "Compliance gap analysis",
    Mock: GapsMock,
  },
  {
    key: "roadmap",
    n: 3,
    title: "Receive Roadmap",
    body: "Get a prioritized roadmap with actions, owners, and estimated effort. Export it as your expansion plan.",
    icon: <RouteIcon className="h-4 w-4" aria-hidden="true" />,
    caption: "Expansion roadmap",
    Mock: RoadmapMock,
  },
];

export function HowItWorksScroller() {
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const target = window.innerHeight * 0.45;
      let bestIdx = 0;
      let bestDist = Infinity;
      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - target);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });
      setActive(bestIdx);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const ActiveMock = STEPS[active].Mock;

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="border-t border-border scroll-mt-20"
    >
      <div className="max-w-[1080px] 2xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center max-w-[720px] mx-auto">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            How It Works
          </div>
          <h2
            id="how-heading"
            className="mt-2 fluid-h2 font-semibold text-navy"
          >
            Three steps to expansion readiness
          </h2>
          <p className="mt-3 text-[14px] sm:text-[15px] text-muted-foreground">
            Scroll through the workflow — from assessment to gap analysis to
            execution-ready roadmap.
          </p>
        </div>

        <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT — sticky visual (desktop only) */}
          <div className="hidden lg:block lg:col-span-7">
            <div className="sticky top-24">
              <MockFrame caption={STEPS[active].caption} stepN={STEPS[active].n}>
                <ActiveMock className="w-full h-auto" />
              </MockFrame>
            </div>
          </div>

          {/* RIGHT — step list */}
          <ol className="lg:col-span-5 space-y-6 lg:space-y-24">
            {STEPS.map((s, i) => {
              const isActive = active === i;
              return (
                <li
                  key={s.key}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  aria-current={isActive ? "step" : undefined}
                  className={`relative rounded-xl p-5 sm:p-6 transition-colors duration-300 ${
                    isActive
                      ? "lg:bg-brand-soft/50 lg:border lg:border-brand/20"
                      : "lg:bg-transparent lg:border lg:border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-[12px] font-semibold tabular-nums transition-colors ${
                        isActive
                          ? "bg-brand text-brand-foreground border-brand"
                          : "bg-card text-muted-foreground border-border"
                      }`}
                    >
                      0{s.n}
                    </span>
                    <div
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                        isActive ? "text-brand" : "text-muted-foreground"
                      }`}
                    >
                      {s.icon}
                      {s.caption}
                    </div>
                  </div>

                  <h3 className="mt-4 text-[20px] sm:text-[22px] font-semibold text-navy">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[14px] sm:text-[15px] leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>

                  {/* Mobile: stacked mock under each step */}
                  <div className="mt-5 lg:hidden">
                    <MockFrame caption={s.caption} stepN={s.n}>
                      <s.Mock className="w-full h-auto" />
                    </MockFrame>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------- Mock chrome wrapper ---------- */

function MockFrame({
  children,
  caption,
  stepN,
}: {
  children: React.ReactNode;
  caption: string;
  stepN: number;
}) {
  return (
    <figure
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
      aria-label={`Step ${stepN} preview: ${caption}`}
    >
      {/* faux browser bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface-muted/60">
        <span className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden />
        <span className="ml-3 text-[11px] text-muted-foreground tabular-nums">
          complee.app / step-{stepN}
        </span>
      </div>
      <div className="bg-card p-4 sm:p-6">{children}</div>
      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  );
}

/* ---------- SVG product mocks ----------
 * All visuals are built as inline SVGs using oklch tokens via CSS variables
 * so they stay theme-consistent and easy to edit.
 */

function AssessMock({ className }: { className?: string }) {
  // Field labels rendered as foreignObject divs so typography matches the app.
  return (
    <svg
      viewBox="0 0 560 360"
      role="img"
      aria-label="Readiness assessment screen mock"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>{`
          .ass-bg { fill: oklch(var(--color-card) / 1); }
          .ass-surface { fill: oklch(var(--color-surface-muted) / 0.6); }
          .ass-border { stroke: oklch(var(--color-border) / 1); fill: none; }
          .ass-text { fill: oklch(var(--color-navy) / 1); font: 600 13px Inter, system-ui, sans-serif; }
          .ass-muted { fill: oklch(var(--color-muted-foreground) / 1); font: 400 11px Inter, system-ui, sans-serif; }
          .ass-label { fill: oklch(var(--color-muted-foreground) / 1); font: 600 10px Inter, system-ui, sans-serif; letter-spacing: 0.06em; text-transform: uppercase; }
          .ass-pill { fill: oklch(var(--color-brand-soft) / 1); }
          .ass-pill-text { fill: oklch(var(--color-brand) / 1); font: 600 10px Inter, system-ui, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; }
          .ass-brand { fill: oklch(var(--color-brand) / 1); }
          .ass-brand-soft { fill: oklch(var(--color-brand-soft) / 1); }
          .ass-progress-bg { fill: oklch(var(--color-muted) / 1); }
        `}</style>
      </defs>

      {/* Eyebrow + title */}
      <rect className="ass-pill" x="20" y="18" rx="10" ry="10" width="92" height="20" />
      <text className="ass-pill-text" x="30" y="32">Step 1 of 3</text>
      <text className="ass-text" x="20" y="62" style={{ font: "600 18px Inter, system-ui, sans-serif" }}>
        Tell us about your business
      </text>
      <text className="ass-muted" x="20" y="80">
        Used to tailor your readiness assessment
      </text>

      {/* Field 1 */}
      <text className="ass-label" x="20" y="106">Company name</text>
      <rect className="ass-surface" x="20" y="114" width="520" height="36" rx="8" />
      <rect className="ass-border" x="20" y="114" width="520" height="36" rx="8" />
      <text className="ass-text" x="32" y="137" style={{ font: "500 13px Inter, system-ui, sans-serif" }}>
        Northwind Payments Ltd
      </text>

      {/* Field 2 + 3 (two columns) */}
      <text className="ass-label" x="20" y="170">Home country</text>
      <rect className="ass-surface" x="20" y="178" width="252" height="36" rx="8" />
      <rect className="ass-border" x="20" y="178" width="252" height="36" rx="8" />
      <text className="ass-text" x="32" y="201" style={{ font: "500 13px Inter, system-ui, sans-serif" }}>
        🇫🇷  France
      </text>

      <text className="ass-label" x="288" y="170">Target country</text>
      <rect className="ass-surface" x="288" y="178" width="252" height="36" rx="8" />
      <rect className="ass-border" x="288" y="178" width="252" height="36" rx="8" />
      <text className="ass-text" x="300" y="201" style={{ font: "500 13px Inter, system-ui, sans-serif" }}>
        🇬🇧  United Kingdom
      </text>

      {/* Institution chips */}
      <text className="ass-label" x="20" y="234">Institution type</text>
      <g transform="translate(20, 244)">
        <rect className="ass-brand-soft" x="0" y="0" width="78" height="26" rx="13" />
        <text x="14" y="17" className="ass-pill-text" style={{ font: "600 11px Inter, system-ui, sans-serif" }}>
          EMI
        </text>
        <rect x="86" y="0" width="78" height="26" rx="13" fill="oklch(var(--color-card))" stroke="oklch(var(--color-border))" />
        <text x="105" y="17" className="ass-muted" style={{ font: "500 11px Inter, system-ui, sans-serif" }}>
          PI
        </text>
        <rect x="172" y="0" width="78" height="26" rx="13" fill="oklch(var(--color-card))" stroke="oklch(var(--color-border))" />
        <text x="190" y="17" className="ass-muted" style={{ font: "500 11px Inter, system-ui, sans-serif" }}>
          Bank
        </text>
        <rect x="258" y="0" width="106" height="26" rx="13" fill="oklch(var(--color-card))" stroke="oklch(var(--color-border))" />
        <text x="275" y="17" className="ass-muted" style={{ font: "500 11px Inter, system-ui, sans-serif" }}>
          Crypto / VASP
        </text>
      </g>

      {/* Progress + CTA */}
      <text className="ass-label" x="20" y="298">Progress</text>
      <rect className="ass-progress-bg" x="20" y="306" width="380" height="6" rx="3" />
      <rect className="ass-brand" x="20" y="306" width="127" height="6" rx="3" />
      <text className="ass-muted" x="408" y="312">33%</text>

      <rect className="ass-brand" x="420" y="320" width="120" height="32" rx="8" />
      <text x="445" y="340" fill="oklch(var(--color-brand-foreground))" style={{ font: "600 12px Inter, system-ui, sans-serif" }}>
        Continue →
      </text>
    </svg>
  );
}

function GapsMock({ className }: { className?: string }) {
  const rows = [
    { label: "GDPR — Data residency", status: "ok", color: "var(--color-success)" },
    { label: "PSD3 — Strong customer auth", status: "partial", color: "var(--color-warning)" },
    { label: "DORA — ICT incident reporting", status: "missing", color: "var(--color-danger)" },
    { label: "PSD2 — Safeguarding accounts", status: "ok", color: "var(--color-success)" },
    { label: "AMLD6 — Beneficial ownership", status: "partial", color: "var(--color-warning)" },
  ];
  const statusLabel = (s: string) =>
    s === "ok" ? "Ready" : s === "partial" ? "Partial" : "Missing";

  return (
    <svg
      viewBox="0 0 560 360"
      role="img"
      aria-label="Compliance gap analysis dashboard mock"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>{`
          .gap-text { fill: oklch(var(--color-navy)); font: 600 13px Inter, system-ui, sans-serif; }
          .gap-muted { fill: oklch(var(--color-muted-foreground)); font: 400 11px Inter, system-ui, sans-serif; }
          .gap-label { fill: oklch(var(--color-muted-foreground)); font: 600 10px Inter, system-ui, sans-serif; letter-spacing: 0.06em; text-transform: uppercase; }
          .gap-row-bg { fill: oklch(var(--color-card)); stroke: oklch(var(--color-border)); }
        `}</style>
      </defs>

      {/* Header row: score card + summary */}
      <g>
        <rect x="20" y="18" width="200" height="92" rx="12" fill="oklch(var(--color-surface-muted) / 0.6)" stroke="oklch(var(--color-border))" />
        <text className="gap-label" x="32" y="38">Readiness Score</text>
        <text x="32" y="78" fill="oklch(var(--color-brand))" style={{ font: "700 34px Inter, system-ui, sans-serif" }}>
          72%
        </text>
        <text className="gap-muted" x="32" y="98">Moderate readiness</text>

        {/* mini bar */}
        <rect x="118" y="68" width="86" height="6" rx="3" fill="oklch(var(--color-muted))" />
        <rect x="118" y="68" width="62" height="6" rx="3" fill="oklch(var(--color-brand))" />
      </g>

      <g transform="translate(232, 18)">
        <rect width="308" height="92" rx="12" fill="oklch(var(--color-card))" stroke="oklch(var(--color-border))" />
        <text className="gap-label" x="14" y="20">Findings</text>

        {/* three pills */}
        <g transform="translate(14, 32)">
          <circle cx="6" cy="22" r="5" fill="oklch(var(--color-success))" />
          <text x="18" y="26" className="gap-text" style={{ font: "600 12px Inter, system-ui, sans-serif" }}>
            12 ready
          </text>

          <circle cx="100" cy="22" r="5" fill="oklch(var(--color-warning))" />
          <text x="112" y="26" className="gap-text" style={{ font: "600 12px Inter, system-ui, sans-serif" }}>
            4 partial
          </text>

          <circle cx="194" cy="22" r="5" fill="oklch(var(--color-danger))" />
          <text x="206" y="26" className="gap-text" style={{ font: "600 12px Inter, system-ui, sans-serif" }}>
            3 missing
          </text>
        </g>

        <text className="gap-muted" x="14" y="80">Across 19 cross-border requirements</text>
      </g>

      {/* Table header */}
      <text className="gap-label" x="20" y="138">Requirement</text>
      <text className="gap-label" x="380" y="138">Status</text>

      {/* Rows */}
      {rows.map((r, i) => {
        const y = 150 + i * 38;
        return (
          <g key={r.label}>
            <rect className="gap-row-bg" x="20" y={y} width="520" height="30" rx="8" />
            <text className="gap-text" x="34" y={y + 19} style={{ font: "500 12.5px Inter, system-ui, sans-serif" }}>
              {r.label}
            </text>
            <circle cx="392" cy={y + 15} r="5" fill={`oklch(${r.color})`} />
            <text x="404" y={y + 19} className="gap-text" style={{ font: "600 11px Inter, system-ui, sans-serif" }}>
              {statusLabel(r.status)}
            </text>
            <text x="486" y={y + 19} className="gap-muted" style={{ font: "500 11px Inter, system-ui, sans-serif" }}>
              View →
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function RoadmapMock({ className }: { className?: string }) {
  const items = [
    { week: "W1", title: "Appoint UK MLRO", track: "Governance" },
    { week: "W2", title: "Update SCA flows for FCA", track: "Engineering" },
    { week: "W3", title: "DORA incident playbook", track: "Operations" },
    { week: "W4", title: "Submit safeguarding report", track: "Legal" },
  ];
  return (
    <svg
      viewBox="0 0 560 360"
      role="img"
      aria-label="Expansion roadmap action plan mock"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>{`
          .rd-text { fill: oklch(var(--color-navy)); font: 600 13px Inter, system-ui, sans-serif; }
          .rd-muted { fill: oklch(var(--color-muted-foreground)); font: 400 11px Inter, system-ui, sans-serif; }
          .rd-label { fill: oklch(var(--color-muted-foreground)); font: 600 10px Inter, system-ui, sans-serif; letter-spacing: 0.06em; text-transform: uppercase; }
        `}</style>
      </defs>

      {/* Header */}
      <text className="rd-label" x="20" y="32">Expansion roadmap · France → UK</text>
      <text x="20" y="58" fill="oklch(var(--color-navy))" style={{ font: "700 18px Inter, system-ui, sans-serif" }}>
        6-week plan to FCA readiness
      </text>

      {/* Top metrics */}
      <g transform="translate(20, 76)">
        <rect width="160" height="60" rx="10" fill="oklch(var(--color-surface-muted) / 0.6)" stroke="oklch(var(--color-border))" />
        <text className="rd-label" x="14" y="20">Estimated effort</text>
        <text x="14" y="46" className="rd-text" style={{ font: "700 18px Inter, system-ui, sans-serif" }}>
          6 weeks
        </text>

        <rect x="172" width="160" height="60" rx="10" fill="oklch(var(--color-card))" stroke="oklch(var(--color-border))" />
        <text className="rd-label" x="186" y="20">Owners assigned</text>
        <text x="186" y="46" className="rd-text" style={{ font: "700 18px Inter, system-ui, sans-serif" }}>
          4 teams
        </text>

        <rect x="344" width="176" height="60" rx="10" fill="oklch(var(--color-card))" stroke="oklch(var(--color-border))" />
        <text className="rd-label" x="358" y="20">Critical items</text>
        <text x="358" y="46" className="rd-text" style={{ font: "700 18px Inter, system-ui, sans-serif" }}>
          3 of 10
        </text>
      </g>

      {/* Timeline header */}
      <line x1="60" y1="172" x2="540" y2="172" stroke="oklch(var(--color-border))" />
      {["W1", "W2", "W3", "W4", "W5", "W6"].map((w, i) => (
        <g key={w}>
          <circle cx={60 + i * 96} cy="172" r="4" fill={i < 4 ? "oklch(var(--color-brand))" : "oklch(var(--color-border))"} />
          <text x={60 + i * 96 - 8} y="160" className="rd-muted">
            {w}
          </text>
        </g>
      ))}

      {/* Action cards */}
      {items.map((it, i) => {
        const y = 196 + i * 38;
        return (
          <g key={it.title}>
            <rect x="20" y={y} width="520" height="30" rx="8" fill="oklch(var(--color-card))" stroke="oklch(var(--color-border))" />
            <rect x="20" y={y} width="4" height="30" rx="2" fill="oklch(var(--color-brand))" />
            <text x="38" y={y + 19} className="rd-text" style={{ font: "600 11px Inter, system-ui, sans-serif" }}>
              {it.week}
            </text>
            <text x="78" y={y + 19} className="rd-text" style={{ font: "500 12.5px Inter, system-ui, sans-serif" }}>
              {it.title}
            </text>
            <rect x="408" y={y + 7} width="86" height="16" rx="8" fill="oklch(var(--color-brand-soft))" />
            <text x="418" y={y + 18} fill="oklch(var(--color-brand))" style={{ font: "600 10px Inter, system-ui, sans-serif" }}>
              {it.track}
            </text>
            <text x="506" y={y + 19} className="rd-muted" style={{ font: "500 11px Inter, system-ui, sans-serif" }}>
              ✓
            </text>
          </g>
        );
      })}
    </svg>
  );
}
