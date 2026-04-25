import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { useAssessment } from "@/store/assessment";
import { useStepProgress } from "@/store/stepProgress";
import { taskKey } from "@/lib/playbook";
import { LogIn, User as UserIcon } from "lucide-react";

const SECTION_NAV = [
  { id: "why-complee", label: "Why Complee" },
  { id: "how-it-works", label: "How It Works" },
  { id: "coverage", label: "Impact" },
  { id: "demo-results", label: "Demo Results" },
] as const;

// Assessment flow steps (the homepage "/" is intentionally excluded so the
// step indicator only appears once the user clicks "Start assessment").
const STEPS = [
  { path: "/profile", label: "Profile" },
  { path: "/documents", label: "Documents" },
  { path: "/processing", label: "Analysis" },
  { path: "/results", label: "Results" },
];

export function Chrome({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  const { assessmentResults } = useAssessment();
  const { byKey } = useStepProgress();

  const isAccountRoute = location.pathname === "/account" || location.pathname === "/auth";
  const isHome = location.pathname === "/";

  const stepIndex = STEPS.findIndex((s) => s.path === location.pathname);
  const idx = isAccountRoute ? -1 : stepIndex;
  const step = idx + 1;
  const pct = idx >= 0 ? (step / STEPS.length) * 100 : 0;

  const [activeSection, setActiveSection] = useState<string>("");

  // Observe sections on the homepage to highlight the active nav link
  useEffect(() => {
    if (!isHome) {
      setActiveSection("");
      return;
    }
    const elements = SECTION_NAV
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome]);

  const handleSectionClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    if (!isHome) return; // let the link navigate to "/#id"
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
      setActiveSection(id);
    }
  };

  // Live roadmap progress (visible whenever there are results)
  const roadmap = useMemo(() => {
    const rows = assessmentResults?.rows ?? [];
    const remediation = rows.filter((r) => r.status !== "covered");
    const done = remediation.filter((r) => byKey[taskKey(r)]?.status === "done").length;
    return { total: remediation.length, done };
  }, [assessmentResults, byKey]);

  const showRoadmapBar = false;
  const roadmapPct = roadmap.total === 0 ? 0 : Math.round((roadmap.done / roadmap.total) * 100);
  const roadmapComplete = roadmap.total > 0 && roadmap.done === roadmap.total;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header
        role="banner"
        className="min-h-[60px] border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30"
      >
        <div className="min-h-[60px] max-w-[1440px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4 py-2">
          <Link
            to="/"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                history.replaceState(null, "", "/");
                setActiveSection("");
              }
            }}
            className="flex items-center gap-2.5 min-w-0 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            aria-label="Complee — back to top"
          >
            <Logo />
            <span className="font-semibold tracking-tight text-[17px] text-navy">Complee</span>
          </Link>

          {/* Center section nav (desktop) */}
          <nav
            aria-label="Page sections"
            className="hidden md:flex items-center gap-1"
          >
            {SECTION_NAV.map((s) => {
              const isActive = isHome && activeSection === s.id;
              return (
                <a
                  key={s.id}
                  href={isHome ? `#${s.id}` : `/#${s.id}`}
                  onClick={(e) => handleSectionClick(e, s.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`inline-flex items-center px-3 py-2 min-h-[40px] rounded-md text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                    isActive
                      ? "text-brand bg-brand-soft"
                      : "text-muted-foreground hover:text-navy hover:bg-surface-muted"
                  }`}
                >
                  {s.label}
                </a>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link
                to="/account"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 min-h-[40px] text-[12px] font-medium text-navy hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <UserIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="max-w-[120px] truncate">
                  {(user.user_metadata?.display_name as string | undefined) ??
                    user.email?.split("@")[0]}
                </span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 min-h-[40px] text-[12px] font-medium text-navy hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                Sign In
              </Link>
            )}

          </div>
        </div>
      </header>

      {/* Mobile section nav (home only) */}
      {isHome && (
        <nav
          aria-label="Page sections (mobile)"
          className="md:hidden border-b border-border bg-card/80 backdrop-blur sticky top-[60px] z-20"
        >
          <div className="max-w-[1440px] mx-auto px-4 py-2 overflow-x-auto">
            <ul className="flex items-center gap-2 min-w-max">
              {SECTION_NAV.map((s) => {
                const isActive = activeSection === s.id;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={(e) => handleSectionClick(e, s.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={`inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                        isActive
                          ? "bg-brand-soft text-brand"
                          : "text-muted-foreground hover:text-navy"
                      }`}
                    >
                      {s.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      )}


      {idx >= 0 && (
        <div className="border-b border-border bg-card">
          <div
            className="max-w-[1440px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-4"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={STEPS.length}
            aria-valuenow={step}
            aria-label={`Assessment step ${step} of ${STEPS.length}: ${STEPS[idx]?.label}`}
          >
            <span className="text-[12px] font-medium text-muted-foreground tabular-nums">
              Step {step} of {STEPS.length}
            </span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-brand transition-all duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[12px] text-muted-foreground hidden md:block">
              {STEPS[idx]?.label}
            </span>
          </div>
        </div>
      )}

      {/* Live roadmap progress bar — visible on results + account when there are tasks */}
      {showRoadmapBar && (
        <div className="border-b border-border bg-brand-soft/40">
          <div className="max-w-[1440px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-3">
            <Link
              to="/results"
              className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand hover:text-brand/80 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Roadmap
            </Link>
            <span
              key={`${roadmap.done}-${roadmap.total}`}
              className="text-[12px] text-navy tabular-nums font-medium animate-in fade-in zoom-in-95 duration-300"
            >
              {roadmap.done}/{roadmap.total} steps
            </span>
            <div
              className="flex-1 h-1.5 bg-card rounded-full overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={roadmapPct}
              aria-label={`Roadmap progress: ${roadmap.done} of ${roadmap.total} steps complete`}
            >
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  roadmapComplete ? "bg-success" : "bg-brand"
                }`}
                style={{ width: `${roadmapPct}%` }}
              />
            </div>
            <span
              key={`pct-${roadmapPct}`}
              className={`text-[12px] font-semibold tabular-nums hidden sm:inline animate-in fade-in duration-300 ${
                roadmapComplete ? "text-success-foreground" : "text-brand"
              }`}
            >
              {roadmapPct}%
            </span>
            {roadmapComplete && (
              <span className="text-[11px] font-semibold text-success-foreground hidden md:inline">
                ✓ Ready to submit
              </span>
            )}
          </div>
        </div>
      )}

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>

      <footer role="contentinfo" className="min-h-10 bg-navy text-navy-foreground">
        <div className="min-h-10 max-w-[1440px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-center text-[11.5px] sm:text-[12px] text-navy-foreground/70 py-3">
          Complee · AI Compliance Consultant for FinTech Companies · 2026
        </div>
      </footer>
    </div>
  );
}
