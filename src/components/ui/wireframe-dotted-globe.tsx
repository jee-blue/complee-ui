import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface RotatingEarthProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function RotatingEarth({
  width = 560,
  height = 560,
  className = "",
}: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

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
        render();
      } catch {
        if (!cancelled) setError("Failed to load globe");
      }
    };

    const rotation: [number, number] = [0, -10];
    let autoRotate = true;
    const rotationSpeed = 0.25;

    const tick = () => {
      if (autoRotate) {
        rotation[0] += rotationSpeed;
        projection.rotate(rotation);
        render();
      }
    };
    const timer = d3.timer(tick);

    const onMouseDown = (event: MouseEvent) => {
      autoRotate = false;
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
        setTimeout(() => {
          autoRotate = true;
        }, 1500);
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

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="block cursor-grab active:cursor-grabbing"
        aria-label="Rotating dotted globe showing global regulatory coverage"
        role="img"
      />
    </div>
  );
}
