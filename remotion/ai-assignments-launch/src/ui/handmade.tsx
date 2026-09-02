import React, { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { getStroke } from "perfect-freehand";
import rough from "roughjs/bundled/rough.esm.js";
import { C } from "../theme";
import { clamp, settle } from "../ease";

// ---- perfect-freehand: a tapered ink stroke that grows point by point ----
const toPath = (pts: number[][]) => {
  if (!pts.length) return "";
  const d = pts.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...pts[0], "Q"] as (string | number)[]
  );
  return d.concat("Z").join(" ");
};

export const InkStroke: React.FC<{
  points: [number, number][]; // stroke skeleton
  at: number;
  dur?: number;
  size?: number;
  color?: string;
  opacity?: number;
  exitAt?: number;
}> = ({ points, at, dur = 22, size = 7, color = C.ink, opacity = 1, exitAt }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: settle });
  const out = exitAt ? interpolate(frame, [exitAt, exitAt + 10], [1, 0], clamp) : 1;
  const n = Math.max(2, Math.round(points.length * p));
  const path = useMemo(() => {
    const stroke = getStroke(points.slice(0, n), {
      size,
      thinning: 0.65,
      smoothing: 0.6,
      streamline: 0.4,
      easing: (t) => t,
      last: p >= 1,
    });
    return toPath(stroke as number[][]);
  }, [n, p, points, size]);
  if (frame < at) return null;
  return <path d={path} fill={color} opacity={opacity * out} />;
};

// ---- rough.js: the teacher's pen (seeded, deterministic) ----
const gen = rough.generator();

export const RoughNote: React.FC<{
  kind: "circle" | "underline";
  x: number;
  y: number;
  w: number;
  h?: number;
  at: number;
  dur?: number;
  color?: string;
  strokeWidth?: number;
  seed?: number;
  exitAt?: number;
}> = ({ kind, x, y, w, h = 40, at, dur = 18, color = C.clay, strokeWidth = 2.4, seed = 7, exitAt }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: settle });
  const out = exitAt ? interpolate(frame, [exitAt, exitAt + 10], [1, 0], clamp) : 1;
  const paths = useMemo(() => {
    const opts = { roughness: 1.6, bowing: 1.8, seed, stroke: color, strokeWidth, disableMultiStroke: false };
    const d =
      kind === "circle"
        ? gen.ellipse(x + w / 2, y + h / 2, w * 1.18, h * 1.5, opts)
        : gen.line(x, y, x + w, y + h * 0, opts);
    return gen.toPaths(d);
  }, [kind, x, y, w, h, seed, color, strokeWidth]);
  if (frame < at) return null;
  return (
    <>
      {paths.map((pp: { d: string }, i: number) => (
        <path
          key={i}
          d={pp.d}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 * (1 - p)}
          opacity={out}
        />
      ))}
    </>
  );
};
