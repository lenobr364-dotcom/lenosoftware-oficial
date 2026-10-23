"use client";

import type { MapPointKind, OperationsMapBounds, OperationsMapPoint } from "@/lib/geo/types";
import { useCallback, useEffect, useRef, useState } from "react";

const KIND_COLOR: Record<MapPointKind, string> = {
  hq: "#fbbf24",
  license: "#22d3ee",
  application: "#34d399",
  imported: "#a78bfa",
  activity: "#f472b6",
  request: "#fb923c",
};

const KIND_RADIUS: Record<MapPointKind, number> = {
  hq: 9,
  license: 5,
  application: 4,
  imported: 4,
  activity: 5,
  request: 4,
};

type OperationsMapCanvasProps = {
  points: OperationsMapPoint[];
  bounds: OperationsMapBounds;
  visibleKinds: Set<MapPointKind>;
  onHoverPoint: (point: OperationsMapPoint | null) => void;
};

function project(
  lat: number,
  lng: number,
  bounds: OperationsMapBounds,
  width: number,
  height: number,
): { x: number; y: number } {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * width;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat || 1)) * height;
  return { x, y };
}

export function OperationsMapCanvas({
  points,
  bounds,
  visibleKinds,
  onHoverPoint,
}: OperationsMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 480 });
  const viewRef = useRef({ zoom: 1, panX: 0, panY: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr) setSize({ w: Math.max(320, cr.width), h: Math.max(280, cr.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const { w, h } = size;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, "#030712");
    grd.addColorStop(0.5, "#0a1628");
    grd.addColorStop(1, "#050a12");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    const grid = 12;
    for (let i = 1; i < grid; i++) {
      const gx = (w / grid) * i;
      const gy = (h / grid) * i;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    const { zoom, panX, panY } = viewRef.current;
    const filtered = points.filter((p) => visibleKinds.has(p.kind));

    for (const p of filtered) {
      const { x, y } = project(p.lat, p.lng, bounds, w, h);
      const px = (x - w / 2) * zoom + w / 2 + panX;
      const py = (y - h / 2) * zoom + h / 2 + panY;
      const r = KIND_RADIUS[p.kind] * Math.sqrt(zoom);

      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = KIND_COLOR[p.kind];
      ctx.globalAlpha = p.kind === "hq" ? 1 : 0.88;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (p.kind === "hq") {
        ctx.strokeStyle = "rgba(251,191,36,0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, r + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }, [bounds, points, size, visibleKinds]);

  useEffect(() => {
    draw();
  }, [draw]);

  const hitTest = useCallback(
    (clientX: number, clientY: number): OperationsMapPoint | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const { w, h } = size;
      const { zoom, panX, panY } = viewRef.current;
      let found: OperationsMapPoint | null = null;
      let best = Infinity;

      for (const p of points) {
        if (!visibleKinds.has(p.kind)) continue;
        const proj = project(p.lat, p.lng, bounds, w, h);
        const px = (proj.x - w / 2) * zoom + w / 2 + panX;
        const py = (proj.y - h / 2) * zoom + h / 2 + panY;
        const d = (px - x) ** 2 + (py - y) ** 2;
        const r = KIND_RADIUS[p.kind] + 6;
        if (d < r * r && d < best) {
          best = d;
          found = p;
        }
      }
      return found;
    },
    [bounds, points, size, visibleKinds],
  );

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        role="img"
        aria-label="Operations map canvas"
        onMouseMove={(e) => onHoverPoint(hitTest(e.clientX, e.clientY))}
        onMouseLeave={() => onHoverPoint(null)}
        onWheel={(e) => {
          e.preventDefault();
          const factor = e.deltaY > 0 ? 0.92 : 1.08;
          viewRef.current.zoom = Math.min(4, Math.max(0.6, viewRef.current.zoom * factor));
          draw();
        }}
        onPointerDown={(e) => {
          const start = { x: e.clientX, y: e.clientY, panX: viewRef.current.panX, panY: viewRef.current.panY };
          const onMove = (ev: PointerEvent) => {
            viewRef.current.panX = start.panX + (ev.clientX - start.x);
            viewRef.current.panY = start.panY + (ev.clientY - start.y);
            draw();
          };
          const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
          };
          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
        }}
      />
    </div>
  );
}
