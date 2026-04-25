import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface RotatingEarthProps {
  width?: number;
  height?: number;
  className?: string;
}

interface RegPoint {
  name: string;
  authority: string;
  lng: number;
  lat: number;
}

const REG_POINTS: RegPoint[] = [
  { name: "France", authority: "ACPR", lng: 2.3522, lat: 48.8566 },
  { name: "UK", authority: "FCA", lng: -0.1276, lat: 51.5074 },
  { name: "Germany", authority: "BaFin", lng: 8.6821, lat: 50.1109 },
  { name: "Netherlands", authority: "DNB", lng: 4.9041, lat: 52.3676 },
];

export default function RotatingEarth({
  width = 560,
  height = 560,
  className = "",
}: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Visible projected points for label overlay
  const [labels, setLabels] = useState<
    { point: RegPoint; x: number; y: number; visible: boolean }[]
  >([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const containerWidth = width;
    const containerHeight = height;
    const radius = Math.min(containerWidth, containerHeight) / 2.4;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    context.scale(dpr, dpr);

    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90);

    const path = d3.geoPath().projection(projection).context(context);

    const pointInPolygon = (point: [number, number], polygon: number[][]) => {
      const [x, y] = point;
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside;
        }
      }
      return inside;
    };

    const pointInFeature = (point: [number, number], feature: any): boolean => {
      const geom = feature.geometry;
      if (geom.type === "Polygon") {
        if (!pointInPolygon(point, geom.coordinates[0])) return false;
        for (let i = 1; i < geom.coordinates.length; i++) {
          if (pointInPolygon(point, geom.coordinates[i])) return false;
        }
        return true;
      }
      if (geom.type === "MultiPolygon") {
        for (const poly of geom.coordinates) {
          if (pointInPolygon(point, poly[0])) {
            let inHole = false;
            for (let i = 1; i < poly.length; i++) {
              if (pointInPolygon(point, poly[i])) {
                inHole = true;
                break;
              }
            }
            if (!inHole) return true;
          }
        }
      }
      return false;
    };

    const generateDots = (feature: any, dotSpacing = 16) => {
      const dots: [number, number][] = [];
      const [[minLng, minLat], [maxLng, maxLat]] = d3.geoBounds(feature);
      const step = dotSpacing * 0.08;
      for (let lng = minLng; lng <= maxLng; lng += step) {
        for (let lat = minLat; lat <= maxLat; lat += step) {
          const p: [number, number] = [lng, lat];
          if (pointInFeature(p, feature)) dots.push(p);
        }
      }
      return dots;
    };

    type Dot = { lng: number; lat: number };
    const allDots: Dot[] = [];
    let landFeatures: any = null;
    let cancelled = false;

    // Animation state for regulatory points (0..1 per point)
    const pointProgress: number[] = REG_POINTS.map(() =>
      prefersReducedMotion ? 1 : 0,
    );
    let animStartTime = 0;
    const POINT_STAGGER = 350; // ms between point reveals
    const POINT_DURATION = 700; // ms per point reveal

    const isPointVisible = (lng: number, lat: number): boolean => {
      // Determine if a geo point is on the visible hemisphere
      const rotate = projection.rotate();
      const lambda = -rotate[0] * (Math.PI / 180);
      const phi = -rotate[1] * (Math.PI / 180);
      const lngR = lng * (Math.PI / 180);
      const latR = lat * (Math.PI / 180);
      const cosC =
        Math.sin(phi) * Math.sin(latR) +
        Math.cos(phi) * Math.cos(latR) * Math.cos(lngR - lambda);
      return cosC > 0;
    };

    const drawRegPoints = () => {
      const newLabels: {
        point: RegPoint;
        x: number;
        y: number;
        visible: boolean;
      }[] = [];
      const cs = projection.scale();
      const sf = cs / radius;

      REG_POINTS.forEach((rp, i) => {
        const projected = projection([rp.lng, rp.lat]);
        const visible = isPointVisible(rp.lng, rp.lat);
        const progress = pointProgress[i];

        if (projected && visible && progress > 0) {
          const [x, y] = projected;
          // Outer pulse halo (ambient subtle)
          const haloR = 6 * sf * progress;
          const grad = context.createRadialGradient(x, y, 0, x, y, haloR * 2.2);
          grad.addColorStop(0, `oklch(0.7 0.2 263 / ${0.55 * progress})`);
          grad.addColorStop(1, "oklch(0.7 0.2 263 / 0)");
          context.beginPath();
          context.arc(x, y, haloR * 2.2, 0, 2 * Math.PI);
          context.fillStyle = grad;
          context.fill();

          // Core dot
          context.beginPath();
          context.arc(x, y, 3.2 * sf, 0, 2 * Math.PI);
          context.fillStyle = `oklch(0.85 0.18 263 / ${Math.min(1, progress + 0.1)})`;
          context.fill();

          // Inner bright center
          context.beginPath();
          context.arc(x, y, 1.4 * sf, 0, 2 * Math.PI);
          context.fillStyle = "oklch(0.98 0.02 263)";
          context.fill();

          newLabels.push({ point: rp, x, y, visible: progress > 0.6 });
        } else {
          newLabels.push({
            point: rp,
            x: projected?.[0] ?? 0,
            y: projected?.[1] ?? 0,
            visible: false,
          });
        }
      });

      setLabels(newLabels);
    };

    const render = () => {
      context.clearRect(0, 0, containerWidth, containerHeight);
      const cs = projection.scale();
      const sf = cs / radius;

      // Globe sphere — navy with subtle brand tint
      const grad = context.createRadialGradient(
        containerWidth / 2 - cs * 0.3,
        containerHeight / 2 - cs * 0.3,
        cs * 0.1,
        containerWidth / 2,
        containerHeight / 2,
        cs,
      );
      grad.addColorStop(0, "oklch(0.32 0.12 263)");
      grad.addColorStop(1, "oklch(0.18 0.06 268)");

      context.beginPath();
      context.arc(containerWidth / 2, containerHeight / 2, cs, 0, 2 * Math.PI);
      context.fillStyle = grad;
      context.fill();
      context.strokeStyle = "oklch(0.7 0.18 263 / 0.45)";
      context.lineWidth = 1.25 * sf;
      context.stroke();

      if (!landFeatures) return;

      // Graticule
      const graticule = d3.geoGraticule();
      context.beginPath();
      path(graticule());
      context.strokeStyle = "oklch(1 0 0)";
      context.lineWidth = 0.75 * sf;
      context.globalAlpha = 0.12;
      context.stroke();
      context.globalAlpha = 1;

      // Land outlines
      context.beginPath();
      landFeatures.features.forEach((f: any) => path(f));
      context.strokeStyle = "oklch(0.85 0.05 263 / 0.55)";
      context.lineWidth = 0.9 * sf;
      context.stroke();

      // Halftone dots over land
      for (const dot of allDots) {
        const projected = projection([dot.lng, dot.lat]);
        if (
          projected &&
          projected[0] >= 0 &&
          projected[0] <= containerWidth &&
          projected[1] >= 0 &&
          projected[1] <= containerHeight
        ) {
          context.beginPath();
          context.arc(projected[0], projected[1], 1.15 * sf, 0, 2 * Math.PI);
          context.fillStyle = "oklch(0.85 0.06 263 / 0.85)";
          context.fill();
        }
      }

      // Regulatory points layer
      drawRegPoints();
    };

    const loadWorld = async () => {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json",
        );
        if (!res.ok) throw new Error("Failed to load land data");
        const data = await res.json();
        if (cancelled) return;
        landFeatures = data;
        landFeatures.features.forEach((f: any) => {
          generateDots(f, 16).forEach(([lng, lat]) =>
            allDots.push({ lng, lat }),
          );
        });
        animStartTime = performance.now();
        render();
      } catch {
        if (!cancelled) setError("Failed to load globe");
      }
    };

    // Final resting orientation — Europe centered
    const FINAL_ROTATION: [number, number] = [-10, -48];
    // Start further west so we ease into Europe
    const START_ROTATION: [number, number] = [-90, -20];
    const rotation: [number, number] = prefersReducedMotion
      ? [...FINAL_ROTATION]
      : [...START_ROTATION];
    projection.rotate(rotation);

    const INTRO_DURATION = 1800; // ms — globe rotates into place
    const POINT_DELAY = INTRO_DURATION - 200; // points start near end of rotation
    let introDone = prefersReducedMotion;
    let frozen = prefersReducedMotion;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const tick = () => {
      if (frozen || animStartTime === 0) return;
      const t = performance.now() - animStartTime;

      // Phase 1: rotate into Europe
      if (!introDone) {
        const p = Math.min(1, t / INTRO_DURATION);
        const e = easeInOutCubic(p);
        rotation[0] = START_ROTATION[0] + (FINAL_ROTATION[0] - START_ROTATION[0]) * e;
        rotation[1] = START_ROTATION[1] + (FINAL_ROTATION[1] - START_ROTATION[1]) * e;
        projection.rotate(rotation);
        if (p >= 1) introDone = true;
      }

      // Phase 2: reveal points (staggered, after rotation nearly complete)
      let pointsDone = true;
      REG_POINTS.forEach((_, i) => {
        const start = POINT_DELAY + i * POINT_STAGGER;
        const local = Math.max(0, Math.min(1, (t - start) / POINT_DURATION));
        pointProgress[i] = local;
        if (local < 1) pointsDone = false;
      });

      render();

      // Freeze permanently once intro + points complete
      if (introDone && pointsDone) {
        frozen = true;
        timer.stop();
      }
    };
    const timer = d3.timer(tick);

    // Allow drag interaction; do NOT resume auto-rotation after release
    const onMouseDown = (event: MouseEvent) => {
      const startX = event.clientX;
      const startY = event.clientY;
      const start: [number, number] = [rotation[0], rotation[1]];

      const onMove = (e: MouseEvent) => {
        const sensitivity = 0.4;
        rotation[0] = start[0] + (e.clientX - startX) * sensitivity;
        rotation[1] = Math.max(
          -90,
          Math.min(90, start[1] - (e.clientY - startY) * sensitivity),
        );
        projection.rotate(rotation);
        render();
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    };

    canvas.addEventListener("mousedown", onMouseDown);
    void loadWorld();

    return () => {
      cancelled = true;
      timer.stop();
      canvas.removeEventListener("mousedown", onMouseDown);
    };
  }, [width, height]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center text-navy-foreground/60 text-sm ${className}`}
        style={{ width, height }}
      >
        {error}
      </div>
    );
  }

  // Compute leader-line label anchors at the globe's edge to avoid overlapping
  // points and Europe. Each label is pushed radially outward from the globe
  // center, then vertically de-overlapped against its siblings.
  const cx = width / 2;
  const cy = height / 2;
  const edgeRadius = Math.min(width, height) / 2.4 + 18; // just outside sphere
  const labelHeight = 22;

  type Anchor = {
    point: RegPoint;
    px: number;
    py: number;
    lx: number;
    ly: number;
    side: "left" | "right";
    visible: boolean;
  };

  const anchors: Anchor[] = labels
    .filter((l) => l.visible)
    .map((l) => {
      const dx = l.x - cx;
      const dy = l.y - cy;
      const len = Math.max(1, Math.hypot(dx, dy));
      // Project the label out along the ray from globe center through the point
      const lx = cx + (dx / len) * edgeRadius;
      const ly = cy + (dy / len) * edgeRadius;
      return {
        point: l.point,
        px: l.x,
        py: l.y,
        lx,
        ly,
        side: dx >= 0 ? ("right" as const) : ("left" as const),
        visible: l.visible,
      };
    });

  // De-overlap labels vertically per side
  (["left", "right"] as const).forEach((side) => {
    const group = anchors
      .filter((a) => a.side === side)
      .sort((a, b) => a.ly - b.ly);
    for (let i = 1; i < group.length; i++) {
      const prev = group[i - 1];
      const curr = group[i];
      if (curr.ly - prev.ly < labelHeight) {
        curr.ly = prev.ly + labelHeight;
      }
    }
  });

  return (
    <div
      className={`relative ${className}`}
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        className="block cursor-grab active:cursor-grabbing"
        aria-label="Rotating dotted globe highlighting European regulatory coverage"
        role="img"
      />

      {/* Leader lines (SVG, hidden on small mobile) */}
      <svg
        className="pointer-events-none absolute inset-0 hidden sm:block"
        width={width}
        height={height}
        aria-hidden="true"
      >
        {anchors.map((a) => (
          <line
            key={`line-${a.point.name}`}
            x1={a.px}
            y1={a.py}
            x2={a.lx}
            y2={a.ly}
            stroke="oklch(0.85 0.06 263 / 0.5)"
            strokeWidth={0.75}
            strokeDasharray="2 2"
            style={{
              opacity: a.visible ? 1 : 0,
              transition: "opacity 600ms ease-out 200ms",
            }}
          />
        ))}
      </svg>

      {/* Compact pill labels — hidden on small mobile to keep points readable */}
      <div
        className="pointer-events-none absolute inset-0 hidden sm:block"
        aria-hidden="true"
      >
        {anchors.map((a) => (
          <div
            key={`label-${a.point.name}`}
            className="absolute transition-opacity duration-500"
            style={{
              left: a.lx,
              top: a.ly,
              opacity: a.visible ? 1 : 0,
              transitionDelay: "200ms",
              transform:
                a.side === "right"
                  ? "translate(6px, -50%)"
                  : "translate(calc(-100% - 6px), -50%)",
              maxWidth: 160,
            }}
          >
            <div className="whitespace-nowrap rounded-full border border-white/10 bg-navy/80 px-2.5 py-1.5 text-[11px] font-medium leading-none text-navy-foreground">
              <span>{a.point.name}</span>
              <span className="mx-1 text-navy-foreground/40">·</span>
              <span className="text-navy-foreground/70">{a.point.authority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
