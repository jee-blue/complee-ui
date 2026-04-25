import { useEffect, useRef, useState } from "react";
import { ClipboardList, Search, Route as RouteIcon } from "lucide-react";
import assessImg from "@/assets/how-step-1-assess.png";
import gapsImg from "@/assets/how-step-2-gaps.png";
import roadmapImg from "@/assets/how-step-3-roadmap.png";

/**
 * How It Works — sticky, scroll-driven storytelling section.
 *
 * Desktop: left column shows a sticky product mock image; right column lists
 * three steps. As the user scrolls, the active step is computed from which
 * step block is closest to the viewport center, and the corresponding mock
 * is shown on the left.
 *
 * Mobile: sticky behavior is disabled; each step renders with its mock
 * stacked directly above it for a linear walkthrough.
 */

type StepKey = "assess" | "gaps" | "roadmap";

interface Step {
  key: StepKey;
  n: number;
  title: string;
  body: string;
  icon: React.ReactNode;
  caption: string;
  image: string;
  alt: string;
}

const STEPS: Step[] = [
  {
    key: "assess",
    n: 1,
    title: "Assess",
    body: "Answer a short readiness assessment tailored to your business — institution type, services, home market and target market.",
    icon: <ClipboardList className="h-4 w-4" aria-hidden="true" />,
    caption: "Readiness assessment",
    image: assessImg,
    alt: "Readiness assessment screen showing company details, home and target country, institution type and a step progress bar.",
  },
  {
    key: "gaps",
    n: 2,
    title: "Identify Gaps",
    body: "See exactly which requirements are ready, partial, or missing for your target market — sourced from real regulator data.",
    icon: <Search className="h-4 w-4" aria-hidden="true" />,
    caption: "Compliance gap analysis",
    image: gapsImg,
    alt: "Compliance gap analysis dashboard showing a 72% readiness score, findings summary, and a list of GDPR, PSD, DORA and AMLD requirements with status indicators.",
  },
  {
    key: "roadmap",
    n: 3,
    title: "Receive Roadmap",
    body: "Get a prioritized roadmap with actions, owners, and estimated effort. Export it as your expansion plan.",
    icon: <RouteIcon className="h-4 w-4" aria-hidden="true" />,
    caption: "Expansion roadmap",
    image: roadmapImg,
    alt: "Six-week expansion roadmap from France to UK showing estimated effort, owners, critical items, a weekly timeline and prioritised actions across Governance, Engineering, Operations and Legal.",
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
              <MockFrame caption={STEPS[active].caption}>
                <div className="relative aspect-[1264/848] w-full">
                  {STEPS.map((s, i) => (
                    <img
                      key={s.key}
                      src={s.image}
                      alt={s.alt}
                      width={1264}
                      height={848}
                      loading="lazy"
                      decoding="async"
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                        active === i ? "opacity-100" : "opacity-0"
                      }`}
                      aria-hidden={active === i ? undefined : true}
                    />
                  ))}
                </div>
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
                    <MockFrame caption={s.caption}>
                      <img
                        src={s.image}
                        alt={s.alt}
                        width={1264}
                        height={848}
                        loading="lazy"
                        decoding="async"
                        className="block w-full h-auto"
                      />
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
}: {
  children: React.ReactNode;
  caption: string;
}) {
  return (
    <figure
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
      aria-label={caption}
    >
      <div className="bg-card">{children}</div>
      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  );
}
