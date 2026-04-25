import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { useAssessment } from "@/store/assessment";
import { useStepProgress } from "@/store/stepProgress";
import { taskKey } from "@/lib/playbook";
import { ArrowRight, LogIn, Menu, User as UserIcon, X } from "lucide-react";

const SECTION_NAV = [
  { id: "how-it-works", label: "How it Works" },
  { id: "use-cases", label: "Use Cases" },
  { id: "requirements", label: "Requirements" },
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

  const stepIndex = STEPS.findIndex((s) => s.path === location.pathname);
  const idx = isAccountRoute ? -1 : stepIndex;
  const step = idx + 1;
  const pct = idx >= 0 ? (step / STEPS.length) * 100 : 0;

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
            className="flex items-center gap-2.5 min-w-0 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            aria-label="Complee home"
          >
            <Logo />
            <span className="font-semibold tracking-tight text-[17px] text-navy">Complee</span>
          </Link>

          <nav aria-label="Account" className="flex items-center gap-2 sm:gap-3">
            <span className="text-[13px] text-muted-foreground hidden md:block">
              AI Compliance Consultant
            </span>
            {user ? (
              <Link
                to="/account"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 min-h-[40px] text-[12px] font-medium text-navy hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <UserIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="max-w-[120px] truncate hidden sm:inline">
                  {(user.user_metadata?.display_name as string | undefined) ??
                    user.email?.split("@")[0]}
                </span>
                <span className="sm:hidden">Account</span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 rounded-lg bg-navy text-navy-foreground px-3 py-2 min-h-[40px] text-[12px] font-medium hover:bg-navy/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Step bar — only inside the assessment flow */}
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

      <footer role="contentinfo" className="min-h-10 border-t border-border bg-card">
        <div className="min-h-10 max-w-[1440px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center text-[11.5px] sm:text-[12px] text-muted-foreground py-2.5">
          Complee · AI Compliance Consultant for FinTech Companies · 2026
        </div>
      </footer>
    </div>
  );
}
